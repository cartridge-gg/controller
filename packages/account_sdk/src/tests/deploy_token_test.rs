use std::vec;

use crate::{
    abigen::controller::{Controller, DeployToken, SignerSignature},
    account::{CartridgeAccount, CartridgeGuardianAccount},
    signers::{
        webauthn::internal::InternalWebauthnSigner, DeployTokenRequestSigner, DeployTokenSigner,
        HashSigner, SignerTrait,
    },
    tests::runners::{katana_runner::KatanaRunner, TestnetRunner},
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::CairoSerde;
use starknet::core::types::Felt;
use starknet::{
    accounts::{Account, Call},
    macros::selector,
    providers::Provider,
    signers::SigningKey,
};

use super::deployment_test::{deploy_two_helper, transfer_helper};

#[tokio::test]
pub async fn test_deploy_token() {
    let other = SigningKey::from_random();
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let (other_address, address) = deploy_two_helper(
        &runner,
        (&other, None as Option<&SigningKey>),
        (&signer, None as Option<&SigningKey>),
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

    let new_signer = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());

    let controller = Controller::new(address, &account);

    assert!(!controller
        .is_valid_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());

    let token = new_signer.sign_deploy_token(&address).await.unwrap();

    let token_signature = signer.sign_deploy_token_request(&token).await.unwrap();

    let tx = other_account.execute_v1(vec![Call {
        to: address,
        selector: selector!("accept_deploy_token"),
        calldata: [
            <DeployToken as CairoSerde>::cairo_serialize(&token),
            <SignerSignature as CairoSerde>::cairo_serialize(&token_signature),
        ]
        .concat(),
    }]);

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * Felt::from(4u128);
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

    assert!(controller
        .is_valid_owner(&new_signer.signer().guid())
        .call()
        .await
        .unwrap());
}
