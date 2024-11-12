use account_sdk::abigen::controller::{Call, OutsideExecutionV3};
use account_sdk::account::outside_execution::{
    OutsideExecution, OutsideExecutionAccount, OutsideExecutionCaller,
};
use account_sdk::account::session::policy::Policy;
use account_sdk::artifacts::{Version, CONTROLLERS};
use account_sdk::controller::Controller;
use account_sdk::factory::ControllerFactory;
use account_sdk::provider::{
    CartridgeJsonRpcProvider, CartridgeProvider, ExecuteFromOutsideError,
    ExecuteFromOutsideResponse,
};
use account_sdk::signers::{Owner, Signer};

use cainome::cairo_serde::ContractAddress;
use rand::Rng as _;
use starknet::accounts::{Account, AccountFactory, AccountFactoryError};
use starknet::core::types::StarknetError;
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::macros::{felt, selector};
use starknet::providers::ProviderError;
use starknet::signers::SigningKey;
use starknet_crypto::Felt;
use std::sync::Arc;
use tokio::time::Duration;
use url::Url;

// Constants for TPS and duration
const TPS: usize = 75;
const DURATION_SECS: u64 = 30 * 60;

#[tokio::main]
async fn main() {
    let rpc_url = Url::parse("https://api.cartridge.gg/x/starknet/mainnet").unwrap();
    let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

    // let chain_id = felt!("0x534e5f5345504f4c4941"); // Hex for "SN_SEPOLIA"
    let chain_id = felt!("0x534e5f4d41494e"); // Hex for "SN_MAIN"

    let signer = SigningKey::from_secret_scalar(felt!(
        "0x6b80fcafbecee2c7ddff50c9a09b529c8f65b2fdb457ea134e76ee17640d768"
    ));
    let owner = Owner::Signer(Signer::Starknet(signer.clone()));
    let username = "bench".to_owned();
    let salt = cairo_short_string_to_felt(&username).unwrap();

    let factory = ControllerFactory::new(
        CONTROLLERS[&Version::LATEST].hash,
        chain_id,
        owner.clone(),
        provider,
    );

    let address = factory.address(salt);

    println!("Controller address: {:#x}", address);

    let mut controller = Controller::new(
        "app_id".to_string(),
        username,
        CONTROLLERS[&Version::LATEST].hash,
        rpc_url,
        owner.clone(),
        address,
        chain_id,
    );

    match factory
        .deploy_v1(salt)
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
        felt!("0x73d81392edc741306bfdef1fce47ce55d5fd1b18914db4ac4257172ddb0f427");

    let duration = Duration::from_secs(DURATION_SECS);
    let total_transactions = TPS * duration.as_secs() as usize;

    let _ = controller
        .create_session(
            vec![Policy::new_call(contract_address, selector!("flip"))],
            u32::MAX as u64,
        )
        .await
        .unwrap();

    let controller = Arc::new(controller);
    let interval = Duration::from_secs_f64(1.0 / TPS as f64);
    let (namespace, bitmask) = (SigningKey::from_random().secret_scalar(), 0u128);
    let nonce_mutex = Arc::new(tokio::sync::Mutex::new((namespace, bitmask)));

    let mut handles = vec![];

    for i in 0..total_transactions {
        let controller = Arc::clone(&controller);
        let nonce_mutex = Arc::clone(&nonce_mutex);
        let handle = tokio::spawn(async move {
            let x = rand::thread_rng().gen_range(0..=256);
            let y: u64 = rand::thread_rng().gen_range(0..=256);

            let mut nonce_lock = nonce_mutex.lock().await;
            let (mut namespace, mut bitmask) = *nonce_lock;

            let nonce_bitmask = if bitmask == u64::MAX.into() {
                namespace = SigningKey::from_random().secret_scalar();
                bitmask = 1;
                1u128
            } else {
                let next_bit = bitmask.trailing_ones();
                let new_bit = 1u128 << next_bit;
                bitmask |= new_bit;
                new_bit
            };

            *nonce_lock = (namespace, bitmask);
            drop(nonce_lock);

            let nonce = (namespace, nonce_bitmask);

            match flip(&controller, contract_address.into(), x, y, nonce).await {
                Ok(_) => {
                    println!("Routine {}: Successfully executed flip function", i);
                }
                Err(err) => {
                    eprintln!("Routine {}: Failed to execute flip function: {:?}", i, err);
                }
            }
        });

        handles.push(handle);
        tokio::time::sleep(interval).await;
    }

    for handle in handles {
        handle.await.unwrap();
    }
}

async fn flip(
    controller: &Controller,
    contract_address: ContractAddress,
    x: u64,
    y: u64,
    nonce: (Felt, u128),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    let team: u64 = rand::thread_rng().gen_range(0..=5);
    let flip = Call {
        to: contract_address,
        selector: selector!("flip"),
        calldata: vec![x.into(), y.into(), team.into()],
    };

    let session_account = controller
        .session_account(&Policy::from_calls(&[flip.clone().into()]))
        .unwrap();

    let flip_execution = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls: vec![flip],
        nonce,
    };

    let flip_signed = session_account
        .sign_outside_execution(OutsideExecution::V3(flip_execution.clone()))
        .await
        .unwrap();

    controller
        .provider
        .add_execute_outside_transaction(
            OutsideExecution::V3(flip_execution),
            controller.address(),
            flip_signed.signature,
        )
        .await
}
