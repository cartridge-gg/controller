use cainome::cairo_serde::{ContractAddress, U256};
use starknet::accounts::{AccountFactory, ExecutionEncoding, SingleOwnerAccount};
use starknet::contract::ContractFactory;
use starknet::core::types::{BlockId, BlockTag};
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::{JsonRpcClient, Provider};
use starknet::signers::LocalWallet;
use starknet::{core::types::Felt, macros::felt, signers::SigningKey};
use std::process::{Command, Stdio};
use std::sync::Arc;
use tokio::task::JoinHandle;
use url::Url;

use lazy_static::lazy_static;

use crate::abigen::erc_20::Erc20;
use crate::artifacts::{Version, CONTROLLERS};
use crate::controller::Controller;
use crate::factory::ControllerFactory;
use crate::provider::CartridgeJsonRpcProvider;
use crate::signers::Owner;
use crate::tests::account::{AccountDeclaration, FEE_TOKEN_ADDRESS, UDC_ADDRESS};
use crate::tests::transaction_waiter::TransactionWaiter;

use super::cartridge::CartridgeProxy;
use super::{find_free_port, SubprocessRunner, TestnetConfig};

lazy_static! {
    // Signing key and address of the katana prefunded account.
    pub static ref PREFUNDED: (SigningKey, Felt) = (
        SigningKey::from_secret_scalar(
            felt!(
                "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"
            ),
        ),
        felt!(
            "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec"
        )
    );

    pub static ref CONFIG: TestnetConfig = TestnetConfig{
        chain_id: "SN_SEPOLIA".to_string(),
        exec: "katana".to_string(),
        log_file_path: "log/katana.log".to_string(),
    };
}

#[derive(Debug)]
pub struct KatanaRunner {
    chain_id: Felt,
    testnet: SubprocessRunner,
    client: CartridgeJsonRpcProvider,
    pub rpc_url: Url,
    rpc_client: Arc<JsonRpcClient<HttpTransport>>,
    proxy_handle: JoinHandle<()>,
}

impl KatanaRunner {
    pub fn new(config: TestnetConfig) -> Self {
        let katana_port = find_free_port();
        let child = Command::new(config.exec)
            .args(["--chain-id", &config.chain_id])
            .args(["--http.port", &katana_port.to_string()])
            .args(["--log.format", "json"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("failed to start subprocess");

        let testnet = SubprocessRunner::new(child, |l| l.contains(r#""target":"katana::cli""#));

        let rpc_url = Url::parse(&format!("http://0.0.0.0:{}/", katana_port)).unwrap();
        let proxy_url = Url::parse(&format!("http://0.0.0.0:{}/", find_free_port())).unwrap();
        let client = CartridgeJsonRpcProvider::new(proxy_url.clone());

        let chain_id = cairo_short_string_to_felt(&config.chain_id).expect("Should convert");
        let rpc_client = Arc::new(JsonRpcClient::new(HttpTransport::new(rpc_url.clone())));
        let proxy = CartridgeProxy::new(rpc_url, proxy_url.clone(), chain_id);
        let proxy_handle = tokio::spawn(async move {
            proxy.run().await;
        });

        KatanaRunner {
            chain_id,
            testnet,
            client,
            rpc_url: proxy_url,
            rpc_client,
            proxy_handle,
        }
    }

    pub fn load() -> Self {
        KatanaRunner::new(CONFIG.clone())
    }

    pub fn client(&self) -> &CartridgeJsonRpcProvider {
        &self.client
    }

    pub async fn executor(&self) -> SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet> {
        single_owner_account_with_encoding(
            &self.rpc_client,
            PREFUNDED.0.clone(),
            PREFUNDED.1,
            self.chain_id,
            ExecutionEncoding::New,
        )
    }

    pub async fn fund(&self, address: &Felt) {
        let prefunded = self.executor().await;
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

    pub async fn declare_controller(&self, version: Version) {
        let prefunded = self.executor().await;

        AccountDeclaration::cartridge_account(self.client(), version)
            .declare(&prefunded)
            .await
            .unwrap()
            .wait_for_completion()
            .await;
    }

    pub async fn deploy_controller(
        &self,
        username: String,
        owner: Owner,
        version: Version,
    ) -> Controller {
        let prefunded: SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet> =
            self.executor().await;

        let class_hash = CONTROLLERS[&version].hash;

        if self
            .client()
            .get_class(BlockId::Tag(BlockTag::Pending), class_hash)
            .await
            .is_err()
        {
            self.declare_controller(version).await;
        }

        let salt = cairo_short_string_to_felt(&username).unwrap();

        let contract_factory = ContractFactory::new_with_udc(class_hash, prefunded, *UDC_ADDRESS);
        let factory = ControllerFactory::new(
            class_hash,
            self.chain_id,
            owner.clone(),
            self.client.clone(),
        );

        let tx = contract_factory
            .deploy_v3(factory.calldata(), salt, false)
            .send()
            .await
            .expect("Unable to deploy contract");

        let address = factory.address(salt);
        self.fund(&address).await;

        TransactionWaiter::new(tx.transaction_hash, self.client())
            .wait()
            .await
            .unwrap();

        Controller::new(
            "app_id".to_string(),
            username,
            CONTROLLERS[&version].hash,
            self.rpc_url.clone(),
            owner,
            address,
            self.chain_id,
        )
    }
}

impl Drop for KatanaRunner {
    fn drop(&mut self) {
        self.testnet.kill();
        self.proxy_handle.abort();
    }
}

pub fn single_owner_account_with_encoding<'a>(
    client: &'a JsonRpcClient<HttpTransport>,
    signing_key: SigningKey,
    account_address: Felt,
    chain_id: Felt,
    encoding: ExecutionEncoding,
) -> SingleOwnerAccount<&'a JsonRpcClient<HttpTransport>, LocalWallet>
where
    &'a JsonRpcClient<HttpTransport>: Provider,
{
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

#[tokio::test]
async fn test_katana_runner() {
    KatanaRunner::load();
}

#[tokio::test]
async fn test_declare_on_katana() {
    let runner = KatanaRunner::load();
    runner.declare_controller(Version::LATEST).await;
}
