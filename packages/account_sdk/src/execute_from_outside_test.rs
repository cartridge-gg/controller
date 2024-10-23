use std::time::Duration;

use starknet::{
    core::types::Call,
    macros::{felt, selector},
    signers::SigningKey,
};

use crate::{
    abigen::{controller::OutsideExecutionV3, erc_20::Erc20},
    account::{outside_execution::OutsideExecutionAccount, session::hash::Policy},
    provider::CartridgeProvider,
};
use crate::{
    account::outside_execution::OutsideExecution, tests::transaction_waiter::TransactionWaiter,
};
use crate::{
    account::outside_execution::OutsideExecutionCaller, tests::runners::katana::KatanaRunner,
};
use crate::{artifacts::Version, signers::Signer};
use crate::{signers::Owner, tests::account::FEE_TOKEN_ADDRESS};
use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};

#[tokio::test]
async fn test_execute_from_outside() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller(
            "testuser".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    let recipient = ContractAddress(felt!("0x18301129"));
    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let calls = vec![Call {
        to: *FEE_TOKEN_ADDRESS,
        selector: selector!("transfer"),
        calldata: [
            <ContractAddress as CairoSerde>::cairo_serialize(&recipient),
            <U256 as CairoSerde>::cairo_serialize(&amount),
        ]
        .concat(),
    }];

    // First execution
    let result = controller.execute_from_outside_v3(calls.clone()).await;
    let response = result.expect("Failed to execute from outside");

    TransactionWaiter::new(response.transaction_hash, runner.client())
        .with_timeout(Duration::from_secs(5))
        .wait()
        .await
        .unwrap();

    {
        let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller);

        let balance = contract_erc20
            .balanceOf(&recipient)
            .call()
            .await
            .expect("failed to call contract");

        assert_eq!(balance, amount);
    }

    for _ in 0..128 {
        let result = controller.execute_from_outside_v3(calls.clone()).await;
        result.expect("Failed to execute from outside");
    }
}

#[tokio::test]
async fn test_execute_from_outside_with_session() {
    let owner_signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller(
            "testuser".to_owned(),
            Owner::Signer(owner_signer.clone()),
            Version::LATEST,
        )
        .await;

    // Create policies for the session
    let policies = vec![
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("approve")),
    ];

    // Create a session
    let session_account = controller
        .create_session(policies, u32::MAX as u64)
        .await
        .expect("Failed to create session");

    let recipient = ContractAddress(felt!("0x18301129"));
    let amount = U256 {
        low: 0x10_u128,
        high: 0,
    };

    let call = Call {
        to: *FEE_TOKEN_ADDRESS,
        selector: selector!("transfer"),
        calldata: [
            <ContractAddress as CairoSerde>::cairo_serialize(&recipient),
            <U256 as CairoSerde>::cairo_serialize(&amount),
        ]
        .concat(),
    };

    // Create OutsideExecution
    let outside_execution = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls: vec![call.into()],
        nonce: (SigningKey::from_random().secret_scalar(), 1),
    };

    // Sign the outside execution with the session account
    let signed_execution = session_account
        .sign_outside_execution(OutsideExecution::V3(outside_execution.clone()))
        .await
        .expect("Failed to sign outside execution");

    // Execute from outside
    let result = controller
        .provider
        .add_execute_outside_transaction(
            OutsideExecution::V3(outside_execution),
            controller.address,
            signed_execution.signature,
        )
        .await
        .expect("Failed to execute from outside");

    TransactionWaiter::new(result.transaction_hash, runner.client())
        .with_timeout(Duration::from_secs(5))
        .wait()
        .await
        .unwrap();

    // Verify the transfer
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller);
    let balance = contract_erc20
        .balanceOf(&recipient)
        .call()
        .await
        .expect("Failed to call contract");

    assert_eq!(balance, amount);
}
