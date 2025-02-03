use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::{
    accounts::Account,
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};

use crate::{
    abigen::{
        controller::{Call, OutsideExecutionV3},
        erc_20::Erc20,
    },
    account::{
        outside_execution::{OutsideExecution, OutsideExecutionAccount, OutsideExecutionCaller},
        session::policy::Policy,
    },
    artifacts::{Version, CONTROLLERS},
    controller::Controller,
    signers::{webauthn::WebauthnSigner, Owner, Signer},
    tests::{
        account::FEE_TOKEN_ADDRESS, runners::katana::KatanaRunner,
        transaction_waiter::TransactionWaiter,
    },
};

pub async fn test_verify_paymaster_execute(signer: Signer, use_session: bool) {
    let runner = KatanaRunner::load();
    let paymaster = runner.executor().await;
    let mut controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    if use_session {
        controller
            .create_session(
                vec![Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer"))],
                u64::MAX,
            )
            .await
            .unwrap();
    };

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let calls = vec![starknet::core::types::Call {
        to: (*FEE_TOKEN_ADDRESS),
        selector: selector!("transfer"),
        calldata: [
            <ContractAddress as CairoSerde>::cairo_serialize(&recipient),
            <U256 as CairoSerde>::cairo_serialize(&amount),
        ]
        .concat(),
    }];

    let tx = controller.execute_from_outside_v3(calls).await.unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    assert_eq!(
        Erc20::new(*FEE_TOKEN_ADDRESS, &paymaster)
            .balanceOf(&recipient)
            .call()
            .await
            .unwrap(),
        amount
    );
}

#[cfg(feature = "webauthn")]
#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet() {
    let signer = Signer::Webauthn(
        WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
        )
        .await
        .unwrap(),
    );

    test_verify_paymaster_execute(signer, false).await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet() {
    test_verify_paymaster_execute(Signer::new_starknet_random(), false).await;
}

#[cfg(feature = "webauthn")]
#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet_session() {
    let signer = Signer::Webauthn(
        WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
        )
        .await
        .unwrap(),
    );

    test_verify_paymaster_execute(signer, true).await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet_session() {
    test_verify_paymaster_execute(Signer::new_starknet_random(), true).await;
}

#[tokio::test]
#[should_panic]
async fn test_verify_execute_paymaster_should_fail() {
    let runner = KatanaRunner::load();
    let signer = Signer::new_starknet_random();
    let paymaster = runner.executor().await;
    let controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let outside_execution = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: u64::MIN,
        execute_before: u64::MAX,
        calls: vec![Call {
            to: (*FEE_TOKEN_ADDRESS).into(),
            selector: selector!("transfer"),
            calldata: [
                <ContractAddress as CairoSerde>::cairo_serialize(&recipient),
                <U256 as CairoSerde>::cairo_serialize(&amount),
            ]
            .concat(),
        }],
        nonce: (SigningKey::from_random().secret_scalar(), 1),
    };

    let wrong_account = Controller::new(
        "app_id".to_string(),
        "username".to_string(),
        CONTROLLERS[&Version::LATEST].hash,
        runner.rpc_url.clone(),
        Owner::Signer(Signer::new_starknet_random()),
        controller.address(),
        runner.client().chain_id().await.unwrap(),
    );

    let outside_execution = wrong_account
        .sign_outside_execution(OutsideExecution::V3(outside_execution.clone()))
        .await
        .unwrap();

    paymaster
        .execute_v3(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_verify_execute_paymaster_session() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let paymaster = runner.executor().await;
    let mut controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x1_u128,
        high: 0,
    };

    let session_account = controller
        .create_session(
            vec![Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer"))],
            u64::MAX,
        )
        .await
        .unwrap();

    let outside_execution = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: u64::MIN,
        execute_before: u64::MAX,
        calls: vec![Call {
            to: (*FEE_TOKEN_ADDRESS).into(),
            selector: selector!("transfer"),
            calldata: [
                <ContractAddress as CairoSerde>::cairo_serialize(&recipient),
                <U256 as CairoSerde>::cairo_serialize(&amount),
            ]
            .concat(),
        }],
        nonce: (SigningKey::from_random().secret_scalar(), 1),
    };

    let outside_execution = session_account
        .sign_outside_execution(OutsideExecution::V3(outside_execution))
        .await
        .unwrap();

    let tx = paymaster
        .execute_v3(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();
}
