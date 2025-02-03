use crate::artifacts::Version;
use crate::signers::{Owner, Signer};
use crate::tests::ensure_txn;
use crate::{abigen::controller::Controller, tests::runners::katana::KatanaRunner};
use cainome::cairo_serde::Zeroable;
use starknet::accounts::Account;
use starknet::core::types::Felt;

#[tokio::test]
async fn test_set_delegate_account_from_account() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let delegate_address = Felt::from_hex("0x1234").unwrap();
    let controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    let delegate_account = controller.delegate_account().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr.is_zero()),
        "should be zero"
    );

    ensure_txn(
        controller.set_delegate_account(delegate_address),
        runner.client(),
    )
    .await
    .unwrap();

    let delegate_account = controller.delegate_account().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr == delegate_address),
        "should be delegate_address"
    );
}

#[tokio::test]
async fn test_set_delegate_account_from_non_owner() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let delegate_address = Felt::from_hex("0x1234").unwrap();
    let external_account = runner.executor().await;
    let signer = Owner::Signer(signer);
    let controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let account_interface_external_account =
        Controller::new(controller.address(), &external_account);

    // non owner set_delegate_account
    let tx = account_interface_external_account
        .set_delegate_account(&delegate_address.into())
        .gas_estimate_multiplier(1.5)
        .send()
        .await;
    assert!(tx.is_err(), "should panic")
}
