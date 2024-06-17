use crate::{
    abigen::{controller::Controller as AbigenController, erc_20::Erc20},
    account::{
        session::{create::SessionCreator, hash::AllowedMethod},
        CartridgeAccount, CartridgeGuardianAccount,
    },
    deploy_contract::FEE_TOKEN_ADDRESS,
    signers::{
        webauthn::internal::InternalWebauthnSigner, HashSigner, NewOwnerSigner, SignerTrait,
    },
    tests::{
        deployment_test::deploy_helper,
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    accounts::Account,
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};

use super::deployment_test::transfer_helper;

#[tokio::test]
async fn test_change_owner() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeAccount::new(
        runner.client(),
        signer.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let account = AbigenController::new(address, account);
    assert_eq!(
        account.get_owner().call().await.unwrap(),
        signer.verifying_key().scalar()
    );
    let new_signer = SigningKey::from_random();
    let old_guid = signer.signer().guid();
    let new_signer_signature = new_signer
        .sign_new_owner(
            &account.account.chain_id,
            &account.account.address,
            &old_guid,
        )
        .await
        .unwrap();
    account
        .change_owner(&new_signer_signature)
        .send()
        .await
        .unwrap();
}

#[tokio::test]
#[should_panic]
async fn test_change_owner_wrong_signature() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeAccount::new(
        runner.client(),
        signer.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let account = AbigenController::new(address, account);
    assert_eq!(
        account.get_owner().call().await.unwrap(),
        signer.verifying_key().scalar()
    );
    let new_signer = SigningKey::from_random();
    let old_guid = signer.signer().guid();
    // We sign the wrong thing thus the owner change should painc
    let new_signer_signature = (&new_signer as &dyn HashSigner)
        .sign(&old_guid)
        .await
        .unwrap();
    account
        .change_owner(&new_signer_signature)
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_change_owner_execute_after() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeAccount::new(
        runner.client(),
        signer.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let account = AbigenController::new(address, account);
    let new_signer = SigningKey::from_random();
    let old_guid = signer.signer().guid();
    let new_signer_signature = new_signer
        .sign_new_owner(
            &account.account.chain_id,
            &account.account.address,
            &old_guid,
        )
        .await
        .unwrap();
    account
        .change_owner(&new_signer_signature)
        .send()
        .await
        .unwrap();

    // Wait for the owner change to be saved on chain
    tokio::time::sleep(std::time::Duration::from_secs(10)).await;

    let new_account = felt!("0x18301129");

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &account.account);

    // Old signature should fail
    if contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .is_ok()
    {
        panic!("Should have failed");
    };

    let account = CartridgeAccount::new(
        runner.client(),
        new_signer.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &account);

    contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_change_owner_invalidate_old_sessions() {
    let signer = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let guardian = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        guardian.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let transfer_method = AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfer"));

    let session_account = account
        .session_account(
            SigningKey::from_random(),
            vec![transfer_method.clone()],
            u64::MAX,
        )
        .await
        .unwrap();

    let account = AbigenController::new(address, account);

    let new_signer = SigningKey::from_random();
    let old_guid = signer.signer().guid();
    let new_signer_signature = new_signer
        .sign_new_owner(
            &account.account.chain_id(),
            &account.account.address(),
            &old_guid,
        )
        .await
        .unwrap();
    account
        .change_owner(&new_signer_signature)
        .send()
        .await
        .unwrap();

    // Wait for the owner change to be saved on chain
    tokio::time::sleep(std::time::Duration::from_secs(10)).await;

    let new_account = felt!("0x18301129");

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    // Old session should fail
    if contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .is_ok()
    {
        panic!("Should have failed");
    };

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        new_signer.clone(),
        guardian.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let session_account = account
        .session_account(SigningKey::from_random(), vec![transfer_method], u64::MAX)
        .await
        .unwrap();
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    // New session should work
    contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}
