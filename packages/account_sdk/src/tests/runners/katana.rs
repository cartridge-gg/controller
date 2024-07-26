use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::accounts::{ExecutionEncoding, SingleOwnerAccount};
use starknet::core::types::{BlockId, BlockTag, DeclareTransactionResult};
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::{JsonRpcClient, Provider};
use starknet::signers::LocalWallet;
use starknet::{core::types::Felt, macros::felt, signers::SigningKey};
use std::process::{Command, Stdio};
use url::Url;

use lazy_static::lazy_static;

use crate::abigen::controller::{self, Signer};
use crate::abigen::erc_20::Erc20;
use crate::account::{CartridgeAccount, CartridgeGuardianAccount};
use crate::signers::HashSigner;
use crate::tests::account::{
    AccountDeclaration, AccountDeployment, DeployResult, FEE_TOKEN_ADDRESS,
};
use crate::transaction_waiter::TransactionWaiter;

use super::{find_free_port, SubprocessRunner, TestnetConfig};

lazy_static! {
    // Signing key and address of the katana prefunded account.
    pub static ref PREFUNDED: (SigningKey, Felt) = (
        SigningKey::from_secret_scalar(
            felt!(
                "0x2bbf4f9fd0bbb2e60b0316c1fe0b76cf7a4d0198bd493ced9b8df2a3a24d68a"
            ),
        ),
        felt!(
            "0xb3ff441a68610b30fd5e2abbf3a1548eb6ba6f3559f2862bf2dc757e5828ca"
        )
    );

    pub static ref CONFIG: TestnetConfig = TestnetConfig{
        port: 1234,
        exec: "katana".to_string(),
        log_file_path: "log/katana.log".to_string(),
    };
}

#[derive(Debug)]
pub struct KatanaRunner {
    testnet: SubprocessRunner,
    client: JsonRpcClient<HttpTransport>,
}

impl KatanaRunner {
    pub fn new(config: TestnetConfig) -> Self {
        let child = Command::new(config.exec)
            .args(["-p", &config.port.to_string()])
            .args(["--json-log"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("failed to start subprocess");

        let testnet = SubprocessRunner::new(child, config.log_file_path, |l| {
            l.contains(r#""target":"katana::cli""#)
        });

        let client = JsonRpcClient::new(HttpTransport::new(
            Url::parse(&format!("http://0.0.0.0:{}/", config.port)).unwrap(),
        ));

        KatanaRunner { testnet, client }
    }

    pub fn load() -> Self {
        KatanaRunner::new(CONFIG.clone().port(find_free_port()))
    }

    pub fn client(&self) -> &JsonRpcClient<HttpTransport> {
        &self.client
    }

    pub async fn prefunded_single_owner_account(
        &self,
    ) -> SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet> {
        single_owner_account_with_encoding(
            &self.client,
            PREFUNDED.0.clone(),
            PREFUNDED.1,
            ExecutionEncoding::New,
        )
        .await
    }

    pub async fn fund(&self, address: &Felt) {
        let prefunded = self.prefunded_single_owner_account().await;
        let erc20_prefunded = Erc20::new(*FEE_TOKEN_ADDRESS, prefunded);

        let tx = erc20_prefunded
            .transfer(
                &ContractAddress(*address),
                &U256 {
                    low: 0x8944000000000000_u128,
                    high: 0,
                },
            )
            .send()
            .await
            .unwrap();

        TransactionWaiter::new(tx.transaction_hash, self.client())
            .wait()
            .await
            .unwrap();
    }

    pub async fn declare_controller(&self) -> Felt {
        let prefunded = self.prefunded_single_owner_account().await;

        let DeclareTransactionResult { class_hash, .. } =
            AccountDeclaration::cartridge_account(self.client())
                .declare(&prefunded)
                .await
                .unwrap()
                .wait_for_completion()
                .await;

        class_hash
    }

    pub async fn deploy_controller<S>(
        &self,
        signer: &S,
    ) -> CartridgeAccount<&JsonRpcClient<HttpTransport>, S>
    where
        S: HashSigner + Clone + Send,
    {
        let prefunded = self.prefunded_single_owner_account().await;
        let class_hash = self.declare_controller().await;

        let mut constructor_calldata = controller::Signer::cairo_serialize(&signer.signer());
        constructor_calldata.extend(Option::<Signer>::cairo_serialize(&None));

        let DeployResult {
            deployed_address,
            transaction_hash,
        } = AccountDeployment::new(self.client())
            .deploy(constructor_calldata, Felt::ZERO, &prefunded, class_hash)
            .await
            .unwrap()
            .wait_for_completion()
            .await;

        TransactionWaiter::new(transaction_hash, self.client())
            .wait()
            .await
            .unwrap();

        self.fund(&deployed_address).await;

        CartridgeAccount::new(
            self.client(),
            signer.clone(),
            deployed_address,
            self.client().chain_id().await.unwrap(),
        )
    }

    pub async fn deploy_controller_with_guardian<S, G>(
        &self,
        signer: &S,
        guardian: &G,
    ) -> CartridgeGuardianAccount<&JsonRpcClient<HttpTransport>, S, G>
    where
        S: HashSigner + Clone + Send,
        G: HashSigner + Clone + Send,
    {
        let prefunded = self.prefunded_single_owner_account().await;
        let class_hash = self.declare_controller().await;

        let mut constructor_calldata = controller::Signer::cairo_serialize(&signer.signer());
        constructor_calldata.extend(Option::<Signer>::cairo_serialize(&Some(guardian.signer())));

        let DeployResult {
            deployed_address, ..
        } = AccountDeployment::new(self.client())
            .deploy(constructor_calldata, Felt::ZERO, &prefunded, class_hash)
            .await
            .unwrap()
            .wait_for_completion()
            .await;

        self.fund(&deployed_address).await;

        CartridgeGuardianAccount::new(
            self.client(),
            signer.clone(),
            guardian.clone(),
            deployed_address,
            self.client().chain_id().await.unwrap(),
        )
    }
}

impl Drop for KatanaRunner {
    fn drop(&mut self) {
        self.testnet.kill();
    }
}

pub async fn single_owner_account_with_encoding<'a, T>(
    client: &'a JsonRpcClient<T>,
    signing_key: SigningKey,
    account_address: Felt,
    encoding: ExecutionEncoding,
) -> SingleOwnerAccount<&'a JsonRpcClient<T>, LocalWallet>
where
    &'a JsonRpcClient<T>: Provider,
    T: Send + Sync,
{
    let chain_id = client.chain_id().await.unwrap();

    let mut account = SingleOwnerAccount::new(
        client,
        LocalWallet::from(signing_key),
        account_address,
        chain_id,
        encoding,
    );

    account.set_block_id(BlockId::Tag(BlockTag::Pending)); // For fetching valid nonce
    account
}

#[test]
fn test_katana_runner() {
    KatanaRunner::load();
}

#[tokio::test]
async fn test_declare_on_katana() {
    let runner = KatanaRunner::load();
    runner.declare_controller().await;
}

// #[tokio::test]
// async fn test_deploy() {
//     let runner = KatanaRunner::load();
//     let account = runner.prefunded_single_owner_account().await;
//     let class_hash = declare(runner.client(), &account).await;
//     let signer = Signer::Starknet(StarknetSigner {
//         pubkey: NonZero::new(felt!("1337")).unwrap(),
//     });
//     deploy(runner.client(), &account, signer, None, class_hash).await;
// }

// #[tokio::test]
// async fn test_deploy_and_call() {
//     let runner: KatanaRunner = KatanaRunner::load();
//     let account = runner.prefunded_single_owner_account().await;
//     let client = runner.client();
//     let class_hash = declare(client, &account).await;
//     let signer = Signer::Starknet(StarknetSigner {
//         pubkey: NonZero::new(felt!("1337")).unwrap(),
//     });
//     let deployed_address = deploy(client, &account, signer.clone(), None, class_hash).await;

//     let contract = Controller::new(deployed_address, account);
//     assert!(contract.is_owner(&signer.guid()).call().await.unwrap());
// }
