use starknet::{
    accounts::{ConnectedAccount, SingleOwnerAccount},
    core::types::{DeclareTransactionResult, Felt},
    macros::felt,
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
    signers::LocalWallet,
};

use super::runners::katana_runner::KatanaRunner;
use crate::{
    abigen::controller::{self, Controller, Signer, StarknetSigner},
    signers::HashSigner,
};
use crate::{
    abigen::erc_20::Erc20,
    deploy_contract::{AccountDeclaration, DeployResult, FEE_TOKEN_ADDRESS},
};
use crate::{deploy_contract::AccountDeployment, tests::runners::TestnetRunner};
use cainome::cairo_serde::{CairoSerde, ContractAddress, NonZero, U256};

pub async fn declare(
    client: &JsonRpcClient<HttpTransport>,
    account: &(impl ConnectedAccount + Send + Sync),
) -> Felt {
    let DeclareTransactionResult { class_hash, .. } = AccountDeclaration::cartridge_account(client)
        .declare::<JsonRpcClient<HttpTransport>>(account)
        .await
        .unwrap()
        .wait_for_completion()
        .await;

    class_hash
}

pub async fn deploy(
    client: &JsonRpcClient<HttpTransport>,
    account: &SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet>,
    owner: Signer,
    guardian: Option<Signer>,
    class_hash: Felt,
) -> Felt {
    let mut constructor_calldata = controller::Signer::cairo_serialize(&owner);
    constructor_calldata.extend(Option::<Signer>::cairo_serialize(&guardian));
    let DeployResult {
        deployed_address, ..
    } = AccountDeployment::new(client)
        .deploy(constructor_calldata, Felt::ZERO, account, class_hash)
        .await
        .unwrap()
        .wait_for_completion()
        .await;
    deployed_address
}

pub async fn deploy_helper<R: TestnetRunner, S: HashSigner + Clone, G: HashSigner + Clone>(
    runner: &R,
    signer: &S,
    guardian: Option<&G>,
) -> Felt {
    let prefunded = runner.prefunded_single_owner_account().await;
    let class_hash = declare(runner.client(), &prefunded).await;

    deploy(
        runner.client(),
        &prefunded,
        signer.signer(),
        guardian.map(|g| g.signer()),
        class_hash,
    )
    .await
}

pub async fn deploy_two_helper<
    R: TestnetRunner,
    S1: HashSigner + Clone,
    G1: HashSigner + Clone,
    S2: HashSigner + Clone,
    G2: HashSigner + Clone,
>(
    runner: &R,
    (signer_1, guardian_1): (&S1, Option<&G1>),
    (signer_2, guardian_2): (&S2, Option<&G2>),
) -> (Felt, Felt) {
    let prefunded = runner.prefunded_single_owner_account().await;
    let class_hash = declare(runner.client(), &prefunded).await;

    let account_1 = deploy(
        runner.client(),
        &prefunded,
        signer_1.signer(),
        guardian_1.map(|g| g.signer()),
        class_hash,
    )
    .await;
    let account_2 = deploy(
        runner.client(),
        &prefunded,
        signer_2.signer(),
        guardian_2.map(|g| g.signer()),
        class_hash,
    )
    .await;
    (account_1, account_2)
}

pub async fn transfer_helper<R: TestnetRunner>(runner: &R, address: &Felt) {
    let prefunded = runner.prefunded_single_owner_account().await;
    let erc20_prefunded = Erc20::new(*FEE_TOKEN_ADDRESS, prefunded);

    erc20_prefunded
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
}

#[tokio::test]
async fn test_declare() {
    let runner = KatanaRunner::load();
    let account = runner.prefunded_single_owner_account().await;
    declare(runner.client(), &account).await;
}

#[tokio::test]
async fn test_deploy() {
    let runner = KatanaRunner::load();
    let account = runner.prefunded_single_owner_account().await;
    let class_hash = declare(runner.client(), &account).await;
    let signer = Signer::Starknet(StarknetSigner {
        pubkey: NonZero::new(felt!("1337")).unwrap(),
    });
    deploy(runner.client(), &account, signer, None, class_hash).await;
}

#[tokio::test]
async fn test_deploy_and_call() {
    let runner = KatanaRunner::load();
    let account = runner.prefunded_single_owner_account().await;
    let client = runner.client();
    let class_hash = declare(client, &account).await;
    let signer = Signer::Starknet(StarknetSigner {
        pubkey: NonZero::new(felt!("1337")).unwrap(),
    });
    let deployed_address = deploy(client, &account, signer, None, class_hash).await;

    let contract = Controller::new(deployed_address, account);
    contract.get_owner().call().await.unwrap();
}
