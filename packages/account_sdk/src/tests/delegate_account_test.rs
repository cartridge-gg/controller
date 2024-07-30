use crate::{
    abigen::controller::Controller, tests::runners::katana::KatanaRunner,
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::Zeroable;
use starknet::core::types::Felt;
use starknet::signers::SigningKey;

#[tokio::test]
async fn test_set_delegate_account_from_account() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let delegate_address = Felt::from_hex("0x1234").unwrap();
    let controller = runner.deploy_controller(&signer).await;
    let account_interface = Controller::new(controller.address, &controller);

    let delegate_account = account_interface.delegate_account().call().await;
    assert!(
        delegate_account.is_ok_and(|addr| addr.is_zero()),
        "should be zero"
    );

    let tx = account_interface
        .set_delegate_account(&delegate_address.into())
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
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
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let delegate_address = Felt::from_hex("0x1234").unwrap();
    let external_account = runner.executor().await;
    let controller = runner.deploy_controller(&signer).await;

    let account_interface_external_account = Controller::new(controller.address, &external_account);

    // non owner set_delegate_account
    let tx = account_interface_external_account
        .set_delegate_account(&delegate_address.into())
        .send()
        .await;
    assert!(tx.is_err(), "should panic")
}
