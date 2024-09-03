use std::vec;

use crate::{
    abigen::{
        controller::{Call, OutsideExecution},
        erc_20::Erc20,
    },
    account::{
        outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller},
        session::{create::SessionCreator, hash::AllowedMethod},
    },
    controller::Controller,
    signers::{webauthn::WebauthnSigner, Signer},
    storage::InMemoryBackend,
    tests::{
        account::{webauthn::SoftPasskeySigner, FEE_TOKEN_ADDRESS},
        ensure_txn,
        runners::katana::KatanaRunner,
    },
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::{
    accounts::Account,
    macros::{felt, selector},
    providers::Provider,
};

pub async fn test_verify_paymaster_execute(signer: Signer, session_signer: Option<Signer>) {
    let runner = KatanaRunner::load();
    let paymaster = runner.executor().await;
    let controller = runner
        .deploy_controller("username".to_owned(), signer)
        .await;

    let account: Box<dyn OutsideExecutionAccount> = match session_signer {
        Some(session_signer) => Box::new(
            controller
                .account
                .session_account(
                    session_signer,
                    vec![AllowedMethod::new(
                        *FEE_TOKEN_ADDRESS,
                        selector!("transfer"),
                    )],
                    u64::MAX,
                )
                .await
                .unwrap(),
        ),
        None => Box::new(controller),
    };

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let outside_execution = OutsideExecution {
        caller: OutsideExecutionCaller::Specific(paymaster.address().into()).into(),
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
        nonce: account.random_outside_execution_nonce(),
    };

    let outside_execution = account
        .sign_outside_execution(outside_execution.clone())
        .await
        .unwrap();

    ensure_txn(
        paymaster.execute_v1(vec![outside_execution.into()]),
        runner.client(),
    )
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

#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet() {
    let signer = Signer::Webauthn(
        WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
            SoftPasskeySigner::new("https://cartridge.gg".try_into().unwrap()),
        )
        .await
        .unwrap(),
    );

    test_verify_paymaster_execute(signer, None as Option<Signer>).await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet() {
    test_verify_paymaster_execute(Signer::new_starknet_random(), None as Option<Signer>).await;
}

#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet_session() {
    let signer = Signer::Webauthn(
        WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
            SoftPasskeySigner::new("https://cartridge.gg".try_into().unwrap()),
        )
        .await
        .unwrap(),
    );

    test_verify_paymaster_execute(signer, Some(Signer::new_starknet_random())).await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet_session() {
    test_verify_paymaster_execute(
        Signer::new_starknet_random(),
        Some(Signer::new_starknet_random()),
    )
    .await;
}

#[tokio::test]
#[should_panic]
async fn test_verify_execute_paymaster_should_fail() {
    let runner = KatanaRunner::load();
    let signer = Signer::new_starknet_random();
    let paymaster = runner.executor().await;
    let controller = runner
        .deploy_controller("username".to_owned(), signer)
        .await;

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let outside_execution = OutsideExecution {
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
        nonce: controller.random_outside_execution_nonce(),
    };

    let wrong_account = Controller::new(
        "app_id".to_string(),
        "username".to_string(),
        runner.client(),
        Signer::new_starknet_random(),
        Signer::new_starknet_random(),
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        InMemoryBackend::default(),
    );

    let outside_execution = wrong_account
        .sign_outside_execution(outside_execution.clone())
        .await
        .unwrap();

    paymaster
        .execute_v1(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_verify_execute_paymaster_session() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let paymaster = runner.executor().await;
    let controller = runner
        .deploy_controller("username".to_owned(), signer)
        .await;

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x1_u128,
        high: 0,
    };

    let session_account = controller
        .account
        .session_account(
            Signer::new_starknet_random(),
            vec![AllowedMethod::new(
                *FEE_TOKEN_ADDRESS,
                selector!("transfer"),
            )],
            u64::MAX,
        )
        .await
        .unwrap();

    let outside_execution = OutsideExecution {
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
        nonce: session_account.random_outside_execution_nonce(),
    };

    let outside_execution = session_account
        .sign_outside_execution(outside_execution)
        .await
        .unwrap();

    let tx = paymaster
        .execute_v1(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();

    TransactionWaiter::new(tx.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();
}
