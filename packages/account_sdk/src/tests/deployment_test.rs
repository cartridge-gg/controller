use starknet::{
    accounts::{Account, Call, ConnectedAccount, SingleOwnerAccount},
    core::types::{BlockId, BlockTag, DeclareTransactionResult, FieldElement},
    macros::{felt, selector},
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
    signers::{LocalWallet, SigningKey},
};

use super::runners::katana_runner::KatanaRunner;
use crate::abigen::controller::{self, Controller, Signer, StarknetSigner};
use crate::deploy_contract::{
    single_owner_account, AccountDeclaration, DeployResult, FEE_TOKEN_ADDRESS,
};
use crate::{deploy_contract::AccountDeployment, tests::runners::TestnetRunner};
use cainome::cairo_serde::{CairoSerde, NonZero};

pub async fn create_account<'a>(
    from: &SingleOwnerAccount<&'a JsonRpcClient<HttpTransport>, LocalWallet>,
) -> (
    SingleOwnerAccount<&'a JsonRpcClient<HttpTransport>, LocalWallet>,
    SigningKey,
) {
    let provider = *from.provider();
    let class_hash = declare(provider, from).await;
    let private_key = SigningKey::from_random();

    let signer = Signer::Starknet(StarknetSigner {
        pubkey: NonZero::new(private_key.verifying_key().scalar()).unwrap(),
    });

    let deployed_address = deploy(provider, from, signer, None, class_hash).await;

    let mut created = single_owner_account(provider, private_key.clone(), deployed_address).await;
    created.set_block_id(BlockId::Tag(BlockTag::Latest));

    from.execute(vec![Call {
        to: *FEE_TOKEN_ADDRESS,
        selector: selector!("transfer"),
        calldata: vec![
            created.address(),
            felt!("100000000000000000000"),
            felt!("0x0"),
        ],
    }])
    .send()
    .await
    .unwrap();

    (created, private_key)
}

pub async fn declare(
    client: &JsonRpcClient<HttpTransport>,
    account: &SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet>,
) -> FieldElement {
    let DeclareTransactionResult { class_hash, .. } = AccountDeclaration::controller(client)
        .declare(account)
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
    class_hash: FieldElement,
) -> FieldElement {
    let mut constructor_calldata = controller::Signer::cairo_serialize(&owner);
    constructor_calldata.extend(Option::<Signer>::cairo_serialize(&guardian));
    let DeployResult {
        deployed_address, ..
    } = AccountDeployment::new(client)
        .deploy(
            constructor_calldata,
            FieldElement::ZERO,
            account,
            class_hash,
        )
        .await
        .unwrap()
        .wait_for_completion()
        .await;
    deployed_address
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
