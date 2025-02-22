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
use starknet::core::types::Felt as felt252;
use std::primitive::{u32, u64};

/* use graphql_client::GraphQLQuery;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "schema.json", query_path = "query.graphql")]
struct ToriiQuery;
 */
// Constants for TPS and duration
const TPS: usize = 5;
const DURATION_SECS: u64 = 30 * 60;
const JACKPOT_ID_NONE: Felt = Felt::ONE;

#[tokio::main]
async fn main() {
    //let rpc_url = Url::parse("https://api.cartridge.gg/x/starknet/mainnet").unwrap();
    let rpc_url = Url::parse("https://api.cartridge.gg/x/nums-appchain/katana").unwrap();
    let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

    // let chain_id = felt!("0x534e5f5345504f4c4941"); // Hex for "SN_SEPOLIA"
    // let chain_id = felt!("0x534e5f4d41494e"); // Hex for "SN_MAIN"
    let chain_id = felt!("0x6e756d732d617070636861696e"); // Hex for "nums-appchain"

    let signer = SigningKey::from_secret_scalar(felt!(
        "0x6b80fcafbecee2c7ddff50c9a09b529c8f65b2fdb457ea134e76ee17640d768"
    ));
    let owner = Owner::Signer(Signer::Starknet(signer.clone()));
    let username = "benchnums2".to_owned();
    let salt = cairo_short_string_to_felt(&username).unwrap();

    let factory = ControllerFactory::new(
        CONTROLLERS[&Version::V1_0_8].hash,
        chain_id,
        owner.clone(),
        provider,
    );

    let address = factory.address(salt);

    println!("Controller address: {:#x}", address);

    let mut controller = Controller::new(
        "https://www.nums.gg".to_string(),
        username,
        CONTROLLERS[&Version::V1_0_8].hash,
        rpc_url,
        owner.clone(),
        address,
        chain_id,
    );

    match factory
        .deploy_v3(salt)
        .gas_estimate_multiplier(1.5)
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
                    println!("Deployment failed tx: {:?}", e);
                }
            } else {
                println!("Deployment failed: {:?}", e);
            }
        }
    }

    let contract_address =
        felt!("0x07f1f581f0e67d83be00a333d8be0e2ef0f5c009f87ae9c483485b9aaa9159ee");

    let duration = Duration::from_secs(DURATION_SECS);
    let total_transactions = TPS * duration.as_secs() as usize;

    let _ = controller
        .create_session(
            vec![Policy::new_call(contract_address, selector!("create_game"))],
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

            match create_game(&controller, contract_address.into(), nonce).await {
                Ok(_) => {
                    println!("Routine {}: Successfully executed create_game function", i);
                }
                Err(err) => {
                    eprintln!("Routine {}: Failed to execute create_game function: {:?}", i, err);
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

async fn create_game(
    controller: &Controller,
    contract_address: ContractAddress,
    nonce: (Felt, u128),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    let c = Call {
        to: contract_address,
        selector: selector!("create_game"),
        calldata: vec![JACKPOT_ID_NONE],
    };

    let session_account = controller
        .session_account(&Policy::from_calls(&[c.clone().into()]))
        .unwrap();

    let exe = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls: vec![c],
        nonce,
    };

    let signed = session_account
        .sign_outside_execution(OutsideExecution::V3(exe.clone()))
        .await
        .unwrap();

    controller
        .provider
        .add_execute_outside_transaction(
            OutsideExecution::V3(exe),
            controller.address(),
            signed.signature,
        )
        .await
}

/*
async fn set_slot(
    controller: &Controller,
    contract_address: ContractAddress,
    game_id: u64,
    nonce: (Felt, u128),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    let c = Call {
        to: contract_address,
        selector: selector!("set_slot"),
        calldata: vec![JACKPOT_ID_NONE],
    };

    let session_account = controller
        .session_account(&Policy::from_calls(&[flip.clone().into()]))
        .unwrap();

    let exe = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls: vec![c],
        nonce,
    };

    let flip_signed = session_account
        .sign_outside_execution(OutsideExecution::V3(exe.clone()))
        .await
        .unwrap();

    controller
        .provider
        .add_execute_outside_transaction(
            OutsideExecution::V3(exe),
            controller.address(),
            flip_signed.signature,
        )
        .await
}
*/