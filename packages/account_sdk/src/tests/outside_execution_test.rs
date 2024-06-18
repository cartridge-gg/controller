use std::vec;

use crate::{
    abigen::erc_20::Erc20,
    account::{
        outside_execution::{OutsideExecution, OutsideExecutionAccount, OutsideExecutionCaller},
        session::{create::SessionCreator, hash::AllowedMethod},
        CartridgeAccount, CartridgeGuardianAccount,
    },
    deploy_contract::FEE_TOKEN_ADDRESS,
    signers::{webauthn::internal::InternalWebauthnSigner, HashSigner},
    tests::runners::{katana_runner::KatanaRunner, TestnetRunner},
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::{
    accounts::{Account, Call},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};

use super::deployment_test::{deploy_two_helper, transfer_helper};

pub async fn test_verify_paymaster_execute<
    S: HashSigner + Clone + Sync + Send,
    G: HashSigner + Clone + Sync + Send,
    H: HashSigner + Clone + Sync + Send + 'static,
>(
    signer: S,
    paymaster: G,
    session_signer: Option<H>,
) {
    let runner = KatanaRunner::load();
    let (paymaster_address, address) = deploy_two_helper(
        &runner,
        (&paymaster, None as Option<&SigningKey>),
        (&signer, None as Option<&SigningKey>),
    )
    .await;

    transfer_helper(&runner, &paymaster_address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let account: Box<dyn OutsideExecutionAccount> = match session_signer {
        Some(session_signer) => Box::new(
            account
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
        None => Box::new(account),
    };

    let paymaster_account = CartridgeAccount::new(
        runner.client(),
        paymaster.clone(),
        paymaster_address,
        runner.client().chain_id().await.unwrap(),
    );

    let new_account = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let outside_execution = OutsideExecution {
        caller: OutsideExecutionCaller::Specific(paymaster_address.into()),
        execute_after: u64::MIN,
        execute_before: u64::MAX,
        calls: vec![Call {
            to: *FEE_TOKEN_ADDRESS,
            selector: selector!("transfer"),
            calldata: [
                <ContractAddress as CairoSerde>::cairo_serialize(&new_account),
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

    paymaster_account
        .execute(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    assert_eq!(
        Erc20::new(*FEE_TOKEN_ADDRESS, &paymaster_account)
            .balanceOf(&new_account)
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
        SigningKey::from_random(),
        None as Option<SigningKey>,
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet() {
    test_verify_paymaster_execute(
        SigningKey::from_random(),
        SigningKey::from_random(),
        None as Option<SigningKey>,
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_webauthn_paymaster_starknet_session() {
    test_verify_paymaster_execute(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        SigningKey::from_random(),
        Some(SigningKey::from_random()),
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_starknet_paymaster_starknet_session() {
    test_verify_paymaster_execute(
        SigningKey::from_random(),
        SigningKey::from_random(),
        Some(SigningKey::from_random()),
    )
    .await;
}

#[tokio::test]
#[should_panic]
async fn test_verify_execute_paymaster_should_fail() {
    let paymaster = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let (paymaster_address, address) = deploy_two_helper(
        &runner,
        (&paymaster, None as Option<&SigningKey>),
        (&signer, None as Option<&SigningKey>),
    )
    .await;

    transfer_helper(&runner, &paymaster_address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let paymaster_account = CartridgeAccount::new(
        runner.client(),
        paymaster.clone(),
        paymaster_address,
        runner.client().chain_id().await.unwrap(),
    );

    let new_account = ContractAddress(felt!("0x18301129"));

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
                <ContractAddress as CairoSerde>::cairo_serialize(&new_account),
                <U256 as CairoSerde>::cairo_serialize(&amount),
            ]
            .concat(),
        }],
        nonce: account.random_outside_execution_nonce(),
    };

    let wrong_account = CartridgeGuardianAccount::new(
        runner.client(),
        SigningKey::from_random(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let outside_execution = wrong_account
        .sign_outside_execution(outside_execution.clone())
        .await
        .unwrap();

    paymaster_account
        .execute(vec![outside_execution.into()])
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_verify_execute_paymaster_session() {
    let paymaster = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let (paymaster_address, address) = deploy_two_helper(
        &runner,
        (&paymaster, None as Option<&SigningKey>),
        (&signer, None as Option<&SigningKey>),
    )
    .await;

    transfer_helper(&runner, &paymaster_address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let paymaster_account = CartridgeAccount::new(
        runner.client(),
        paymaster.clone(),
        paymaster_address,
        runner.client().chain_id().await.unwrap(),
    );

    let new_account = ContractAddress(felt!("0x18301129"));

    let amount = U256 {
        low: 0x1_u128,
        high: 0,
    };

    let session_account = account
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

    for i in 0u32..3 {
        let outside_execution = OutsideExecution {
            caller: OutsideExecutionCaller::Any,
            execute_after: u64::MIN,
            execute_before: u64::MAX,
            calls: vec![Call {
                to: *FEE_TOKEN_ADDRESS,
                selector: selector!("transfer"),
                calldata: [
                    <ContractAddress as CairoSerde>::cairo_serialize(&new_account),
                    <U256 as CairoSerde>::cairo_serialize(&amount),
                ]
                .concat(),
            }],
            nonce: session_account.random_outside_execution_nonce(),
        };

        let outside_execution = session_account
            .sign_outside_execution(outside_execution.clone())
            .await
            .unwrap();

        let tx = paymaster_account.execute(vec![outside_execution.clone().into()]);
        let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * 4u32.into();
        let tx = tx.nonce(i.into()).max_fee(fee_estimate).prepared().unwrap();

        let tx_hash = tx.transaction_hash(false);
        tx.send().await.unwrap();
        TransactionWaiter::new(tx_hash, runner.client())
            .wait()
            .await
            .unwrap();
    }
}
