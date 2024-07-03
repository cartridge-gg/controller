use crate::{
    abigen::controller::Controller,
    account::{CartridgeAccount, CartridgeGuardianAccount},
    signers::webauthn::internal::InternalWebauthnSigner,
    tests::{
        deployment_test::{deploy_helper, deploy_two_helper, transfer_helper},
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::Zeroable;
use starknet::{providers::Provider, signers::SigningKey};
use starknet_crypto::FieldElement;

#[tokio::test]
async fn test_set_delegate_account_from_account() {
    let signer = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let runner = KatanaRunner::load();
    let delegate_address = FieldElement::from_hex_be("0x1234").unwrap();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    let account = CartridgeAccount::new(
        runner.client(),
        signer.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let account_interface = Controller::new(address, &account);

    let delegate_account = account_interface.delegate_account().call().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr.is_zero()),
        "should be zero"
    );

    let tx = account_interface.set_delegate_account(&delegate_address.into());

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * 4u32.into();
    let tx = tx
        .nonce(0u32.into())
        .max_fee(fee_estimate)
        .prepared()
        .unwrap();

    let tx_hash = tx.transaction_hash(false);
    tx.send().await.unwrap();
    TransactionWaiter::new(tx_hash, runner.client())
        .wait()
        .await
        .unwrap();

    let delegate_account = account_interface.delegate_account().call().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr == delegate_address.into()),
        "should be delegate_address"
    );
}

#[tokio::test]
async fn test_set_delegate_account_from_owner() {
    let other = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let signer = SigningKey::from_random();
    let guardian_signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let delegate_address = FieldElement::from_hex_be("0x1234").unwrap();
    let (other_address, address) = deploy_two_helper(
        &runner,
        (&other, None as Option<&SigningKey>),
        (&signer, Some(&guardian_signer)),
    )
    .await;

    transfer_helper(&runner, &other_address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let other_account = CartridgeAccount::new(
        runner.client(),
        other.clone(),
        other_address,
        runner.client().chain_id().await.unwrap(),
    );

    let account_interface = Controller::new(address, &account);
    let account_interface_external = Controller::new(address, &other_account);

    // register_external_owner
    let tx = account_interface.register_external_owner(&other_address.into());

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * 4u32.into();
    let tx = tx
        .nonce(0u32.into())
        .max_fee(fee_estimate)
        .prepared()
        .unwrap();

    let tx_hash = tx.transaction_hash(false);
    tx.send().await.unwrap();
    TransactionWaiter::new(tx_hash, runner.client())
        .wait()
        .await
        .unwrap();

    // external owner set_delegate_account
    let tx = account_interface_external.set_delegate_account(&delegate_address.into());

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * 4u32.into();
    let tx = tx
        .nonce(0u32.into())
        .max_fee(fee_estimate)
        .prepared()
        .unwrap();

    let tx_hash = tx.transaction_hash(false);
    tx.send().await.unwrap();
    TransactionWaiter::new(tx_hash, runner.client())
        .wait()
        .await
        .unwrap();

    let delegate_account = account_interface.delegate_account().call().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr == delegate_address.into()),
        "should be delegate_address"
    );
}

#[tokio::test]
async fn test_set_delegate_account_from_non_owner() {
    let other = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let signer = SigningKey::from_random();
    let guardian_signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let delegate_address = FieldElement::from_hex_be("0x1234").unwrap();
    let (other_address, address) = deploy_two_helper(
        &runner,
        (&other, None as Option<&SigningKey>),
        (&signer, Some(&guardian_signer)),
    )
    .await;

    transfer_helper(&runner, &other_address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    let other_account = CartridgeAccount::new(
        runner.client(),
        other.clone(),
        other_address,
        runner.client().chain_id().await.unwrap(),
    );

    let account_interface_not_owner = Controller::new(address, &other_account);

    // non owner set_delegate_account
    let tx = account_interface_not_owner.set_delegate_account(&delegate_address.into());

    let res = tx.estimate_fee().await;
    assert!(res.is_err(), "should panic")
}
