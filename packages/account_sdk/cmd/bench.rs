use account_sdk::abigen::controller::{Call, OutsideExecution};
use account_sdk::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use account_sdk::account::session::hash::Policy;
use account_sdk::account::session::SessionAccount;
use account_sdk::artifacts::{Version, CONTROLLERS};
use account_sdk::controller::Controller;
use account_sdk::provider::{
    CartridgeProvider, ExecuteFromOutsideError, ExecuteFromOutsideResponse,
};
use account_sdk::signers::Signer;

use cainome::cairo_serde::ContractAddress;
use rand::Rng as _;
use starknet::accounts::AccountFactoryError;
use starknet::core::types::StarknetError;
use starknet::core::utils::get_selector_from_name;
use starknet::macros::{felt, selector};
use starknet::providers::ProviderError;
use starknet::signers::SigningKey;
use starknet_crypto::Felt;
use std::sync::Arc;
use tokio::time::Duration;
use url::Url;

// Constants for TPS and duration
const TPS: usize = 1;
const DURATION_SECS: u64 = 30 * 60;

const BENCH_ACCOUNT: Felt =
    felt!("0x6969f7376a7f90c3cf8c2b1fcded1eaf272ca182008a32ab7d0b3e5f30ee544");

#[tokio::main]
async fn main() {
    let rpc_url = Url::parse("http://localhost:8001/x/starknet/sepolia").unwrap();
    // let rpc_url = Url::parse("https://api.cartridge.gg/x/starknet/sepolia").unwrap();
    let chain_id = felt!("0x534e5f5345504f4c4941"); // Hex for "SN_SEPOLIA"

    let owner = Signer::Starknet(SigningKey::from_secret_scalar(felt!(
        "0x6b80fcafbecee2c7ddff50c9a09b529c8f65b2fdb457ea134e76ee17640d768"
    )));
    let username = "bench".to_owned();

    let mut controller = Controller::new(
        "app_id".to_string(),
        username,
        CONTROLLERS[&Version::LATEST].hash,
        rpc_url,
        owner.clone(),
        BENCH_ACCOUNT,
        chain_id,
    );

    match controller
        .deploy()
        .fee_estimate_multiplier(1.5)
        .send()
        .await
    {
        Ok(_) => (),
        Err(e) => {
            if let AccountFactoryError::Provider(ProviderError::StarknetError(
                StarknetError::TransactionExecutionError(ref error_data),
            )) = e
            {
                if !error_data
                    .execution_error
                    .contains("is unavailable for deployment")
                {
                    println!("Deployment failed: {:?}", e);
                }
            } else {
                println!("Deployment failed: {:?}", e);
            }
        }
    }

    let contract_address =
        felt!("0x165a91f138a5c5f5016a0afe3412b551559b3de4d89357282fe145e3e3c404b");

    let duration = Duration::from_secs(DURATION_SECS);
    let total_transactions = TPS * duration.as_secs() as usize;

    let session_account = controller
        .create_session(
            vec![Policy::new(contract_address, selector!("flip"))],
            u32::MAX as u64,
        )
        .await
        .unwrap();

    let controller = Arc::new(controller);
    let interval = Duration::from_secs_f64(1.0 / TPS as f64);

    // let mut handles = vec![];

    for i in 0..total_transactions {
        let controller = Arc::clone(&controller);
        let x = rand::thread_rng().gen_range(0..=100);
        let y = rand::thread_rng().gen_range(0..=100);

        match flip(&controller, &session_account, contract_address.into(), x, y).await {
            Ok(_) => {
                println!("Routine {}: Successfully executed flip function", i);
            }
            Err(err) => {
                eprintln!("Routine {}: Failed to execute flip function: {:?}", i, err);
            }
        }
        // });

        // handles.push(handle);
        tokio::time::sleep(interval).await;
    }

    // for handle in handles {
    //     handle.await.unwrap();
    // }
}

async fn flip(
    controller: &Controller,
    session_account: &SessionAccount,
    contract_address: ContractAddress,
    x: u64,
    y: u64,
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    let flip = Call {
        to: contract_address,
        selector: selector!("flip"),
        calldata: vec![x.into(), y.into()],
    };

    let flip_execution = OutsideExecution {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls: vec![flip],
        nonce: (Felt::ONE, Felt::ZERO),
    };

    let flip_signed = session_account
        .sign_outside_execution(flip_execution.clone())
        .await
        .unwrap();

    controller
        .provider
        .add_execute_outside_transaction(flip_execution, BENCH_ACCOUNT, flip_signed.signature)
        .await
}

#[cfg(test)]
// mod tests {
//     use super::*;
//     use account_sdk::tests::runners::katana::KatanaRunner;
//     use account_sdk::tests::transaction_waiter::TransactionWaiter;
//     use starknet::macros::felt;
//     use std::time::Duration;

//     #[tokio::test]
//     async fn test_flip() {
//         let signer = Signer::new_starknet_random();
//         let runner = KatanaRunner::load();
//         let controller = runner
//             .deploy_controller("testuser".to_owned(), signer, Version::LATEST)
//             .await;

//         // Create policies for the session
//         let policies = vec![Policy::new(
//             BENCH_ACCOUNT,
//             get_selector_from_name("flip").unwrap(),
//         )];

//         // Create a session
//         let session_account = controller
//             .create_session(policies, u64::MAX)
//             .await
//             .expect("Failed to create session");

//         let contract_address = ContractAddress(felt!("0x1234")); // Replace with actual contract address
//         let x = 1;
//         let y = 2;

//         let result = flip(&controller, &session_account, contract_address, x, y).await;
//         assert!(result.is_ok(), "Flip operation failed");

//         if let Ok(response) = result {
//             TransactionWaiter::new(response.transaction_hash, runner.client())
//                 .with_timeout(Duration::from_secs(5))
//                 .wait()
//                 .await
//                 .unwrap();

//             // Here you would typically verify the state change caused by the flip
//             // This depends on what your flip function does and how you can verify its effects
//             // For example:
//             // let new_state = get_state_after_flip(contract_address, x, y).await;
//             // assert_eq!(new_state, expected_state);
//         }
//     }
// }
