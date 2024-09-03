use std::time::Duration;

use starknet::macros::{felt, selector};

use crate::abigen::controller::{Call, OutsideExecution};
use crate::abigen::erc_20::Erc20;
use crate::account::outside_execution::OutsideExecutionCaller;
use crate::signers::Signer;
use crate::tests::account::FEE_TOKEN_ADDRESS;
use crate::tests::runners::katana::KatanaRunner;
use crate::transaction_waiter::TransactionWaiter;
use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::signers::SigningKey;

#[tokio::test]
async fn test_paymaster_request_success() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("testuser".to_owned(), signer)
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
        nonce: SigningKey::from_random().secret_scalar(),
    };

    let result = controller.execute_from_outside(outside_execution).await;
    let response = result.expect("Failed to execute from outside");

    TransactionWaiter::new(response, runner.client())
        .with_timeout(Duration::from_secs(5))
        .wait()
        .await
        .unwrap();

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller);

    let balance = contract_erc20
        .balanceOf(&recipient)
        .call()
        .await
        .expect("failed to call contract");

    assert_eq!(balance, amount);
}
