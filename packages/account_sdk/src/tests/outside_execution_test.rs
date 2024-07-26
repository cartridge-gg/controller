use std::vec;

use crate::{
    abigen::erc_20::Erc20,
    account::{
        outside_execution::{OutsideExecution, OutsideExecutionAccount, OutsideExecutionCaller},
        session::{create::SessionCreator, hash::AllowedMethod},
        CartridgeGuardianAccount,
    },
    signers::HashSigner,
    tests::{
        account::{signers::InternalWebauthnSigner, FEE_TOKEN_ADDRESS},
        runners::katana::KatanaRunner,
    },
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::{
    accounts::{Account, Call},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};

pub async fn test_verify_paymaster_execute<
    S: HashSigner + Clone + Sync + Send,
    H: HashSigner + Clone + Sync + Send + 'static,
>(
    signer: S,
    session_signer: Option<H>,
) {
    let runner = KatanaRunner::load();
    let paymaster = runner.prefunded_single_owner_account().await;
    let controller = runner.deploy_controller(&signer).await;

    let account: Box<dyn OutsideExecutionAccount> = match session_signer {
        Some(session_signer) => Box::new(
            controller
                .session_account(
                    session_signer,
                    vec![AllowedMethod::with_selector(
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
        caller: OutsideExecutionCaller::Specific(paymaster.address().into()),
        execute_after: u64::MIN,
        execute_before: u64::MAX,
        calls: vec![Call {
            to: *FEE_TOKEN_ADDRESS,
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

    let tx = paymaster
        .execute_v1(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();

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

#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet() {
    test_verify_paymaster_execute(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        None as Option<SigningKey>,
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet() {
    test_verify_paymaster_execute(SigningKey::from_random(), None as Option<SigningKey>).await;
}

#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet_session() {
    test_verify_paymaster_execute(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        Some(SigningKey::from_random()),
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet_session() {
    test_verify_paymaster_execute(SigningKey::from_random(), Some(SigningKey::from_random())).await;
}

#[tokio::test]
#[should_panic]
async fn test_verify_execute_paymaster_should_fail() {
    let runner = KatanaRunner::load();
    let signer = SigningKey::from_random();
    let paymaster = runner.prefunded_single_owner_account().await;
    let controller = runner.deploy_controller(&signer).await;

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let outside_execution = OutsideExecution {
        caller: OutsideExecutionCaller::Any,
        execute_after: u64::MIN,
        execute_before: u64::MAX,
        calls: vec![Call {
            to: *FEE_TOKEN_ADDRESS,
            selector: selector!("transfer"),
            calldata: [
                <ContractAddress as CairoSerde>::cairo_serialize(&recipient),
                <U256 as CairoSerde>::cairo_serialize(&amount),
            ]
            .concat(),
        }],
        nonce: controller.random_outside_execution_nonce(),
    };

    let wrong_account = CartridgeGuardianAccount::new(
        runner.client(),
        SigningKey::from_random(),
        SigningKey::from_random(),
        controller.address,
        runner.client().chain_id().await.unwrap(),
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
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let paymaster = runner.prefunded_single_owner_account().await;
    let controller = runner.deploy_controller(&signer).await;

    let recipient = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x1_u128,
        high: 0,
    };

    let session_account = controller
        .session_account(
            SigningKey::from_random(),
            vec![AllowedMethod::with_selector(
                *FEE_TOKEN_ADDRESS,
                selector!("transfer"),
            )],
            u64::MAX,
        )
        .await
        .unwrap();

    let outside_execution = OutsideExecution {
        caller: OutsideExecutionCaller::Any,
        execute_after: u64::MIN,
        execute_before: u64::MAX,
        calls: vec![Call {
            to: *FEE_TOKEN_ADDRESS,
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
