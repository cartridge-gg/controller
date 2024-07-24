use crate::account::session::create::SessionCreator;
use crate::account::session::hash::AllowedMethod;
use crate::account::DECLARATION_SELECTOR;
use crate::tests::deploy_contract::AccountDeclaration;
use starknet::{providers::Provider, signers::SigningKey};

use crate::{
    account::CartridgeGuardianAccount,
    tests::{
        deployment_test::{deploy_helper, transfer_helper},
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
};

#[tokio::test]
async fn test_declaration_using_account() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    AccountDeclaration::erc_20(runner.client())
        .declare(&account)
        .await
        .unwrap()
        .wait_for_completion()
        .await;
}

#[tokio::test]
async fn test_declaration_using_session_account() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    )
    .session_account(
        SigningKey::from_random(),
        vec![AllowedMethod {
            contract_address: address,
            selector: DECLARATION_SELECTOR,
        }],
        u64::MAX,
    )
    .await
    .unwrap();

    AccountDeclaration::erc_20(runner.client())
        .declare(&account)
        .await
        .unwrap()
        .wait_for_completion()
        .await;
}
