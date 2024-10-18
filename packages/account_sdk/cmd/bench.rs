use account_sdk::abigen::controller::{Call, OutsideExecution};
use account_sdk::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use account_sdk::account::session::hash::Policy;
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
const TPS: usize = 1;
const DURATION_SECS: u64 = 30 * 60;

#[tokio::main]
async fn main() {
    let rpc_url = Url::parse("https://api.cartridge.gg/x/starknet/sepolia").unwrap();
    let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

    let chain_id = felt!("0x534e5f5345504f4c4941"); // Hex for "SN_SEPOLIA"

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
        felt!("0x165a91f138a5c5f5016a0afe3412b551559b3de4d89357282fe145e3e3c404b");

    let duration = Duration::from_secs(DURATION_SECS);
    let total_transactions = TPS * duration.as_secs() as usize;

    let _ = controller
        .create_session(
            vec![Policy::new(contract_address, selector!("flip"))],
            u32::MAX as u64,
        )
        .await
        .unwrap();

    let controller = Arc::new(controller);
    let interval = Duration::from_secs_f64(1.0 / TPS as f64);
    let nonce_channel = SigningKey::from_random().secret_scalar();
    let nonce_counter = Arc::new(std::sync::atomic::AtomicU64::new(0));

    let mut handles = vec![];

    for i in 0..total_transactions {
        let controller = Arc::clone(&controller);
        let nonce_counter = Arc::clone(&nonce_counter);
        let handle = tokio::spawn(async move {
            let x = rand::thread_rng().gen_range(0..=100);
            let y = rand::thread_rng().gen_range(0..=100);
            let nonce_increment = nonce_counter.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            let nonce = (nonce_channel, Felt::from(nonce_increment));

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
    nonce: (Felt, Felt),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    let flip = Call {
        to: contract_address,
        selector: selector!("flip"),
        calldata: vec![x.into(), y.into()],
    };

    let session_account = controller.session_account(&[flip.clone().into()]).unwrap();

    let flip_execution = OutsideExecution {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls: vec![flip],
        nonce,
    };

    let flip_signed = session_account
        .sign_outside_execution(flip_execution.clone())
        .await
        .unwrap();

    controller
        .provider
        .add_execute_outside_transaction(
            flip_execution,
            controller.address(),
            flip_signed.signature,
        )
        .await
}
