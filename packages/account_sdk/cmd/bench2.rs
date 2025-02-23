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
use futures::StreamExt;
use rand::Rng as _;
use starknet::accounts::{Account, AccountFactory, AccountFactoryError};
use starknet::core::types::Felt as felt252;
use starknet::core::types::StarknetError;
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::macros::{felt, selector};
use starknet::providers::ProviderError;
use starknet::signers::SigningKey;
use starknet_crypto::Felt;
use std::primitive::{u32, u64};
use std::sync::Arc;
use tokio::time::Duration;
use torii_grpc::types::{EntityKeysClause, KeysClause, PatternMatching};
use url::Url;

// Constants for TPS and duration
const TPS: usize = 5;
const DURATION_SECS: u64 = 30 * 60;
const JACKPOT_ID_NONE: Felt = Felt::ONE;
const WORLD_ADDRESS: Felt =
    felt!("0x7686a16189676ac3978c3b865ae7e3d625a1cd7438800849c7fd866e4b9afd1");
const SERVICE_BASE_URL: &str = "https://api.cartridge.gg/x/nums-appchain";

#[tokio::main]
async fn main() {
    //let rpc_url = Url::parse("https://api.cartridge.gg/x/starknet/mainnet").unwrap();
    let rpc_url = Url::parse(format!("{}/katana", SERVICE_BASE_URL).as_str()).unwrap();
    let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

    // let chain_id = felt!("0x534e5f5345504f4c4941"); // Hex for "SN_SEPOLIA"
    // let chain_id = felt!("0x534e5f4d41494e"); // Hex for "SN_MAIN"
    let chain_id = felt!("0x57505f4e554d535f415050434841494e"); // Hex for "WP_NUMS_APPCHAIN"

    let signer = SigningKey::from_secret_scalar(felt!(
        "0x6b80fcafbecee2c7ddff50c9a09b529c8f65b2fdb457ea134e76ee17640d768"
    ));
    let owner = Owner::Signer(Signer::Starknet(signer.clone()));
    let username = "benchnums4".to_owned();
    let salt = cairo_short_string_to_felt(&username).unwrap();

    let factory = ControllerFactory::new(
        CONTROLLERS[&Version::V1_0_8].hash,
        chain_id,
        owner.clone(),
        provider,
    );

    let controller_address = factory.address(salt);

    println!("Controller address: {:#x}", controller_address);

    let mut controller = Controller::new(
        "https://www.slot.nums.gg".to_string(),
        username,
        CONTROLLERS[&Version::V1_0_8].hash,
        rpc_url,
        owner.clone(),
        controller_address,
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
        felt!("0x04057ea6852973079449b3f99ae8a346a10706a4dd5bd072cbe6c3f97508d5b0");

    let duration = Duration::from_secs(DURATION_SECS);
    let total_transactions = TPS * duration.as_secs() as usize;
    let total_transactions = 1;

    let _ = controller
        .create_session(
            vec![
                Policy::new_call(contract_address, selector!("create_game")),
                Policy::new_call(contract_address, selector!("set_slot")),
            ],
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

            let torii = torii_client::client::Client::new(
                format!("{}/torii", SERVICE_BASE_URL),
                format!("{}/katana", SERVICE_BASE_URL),
                "".to_string(),
                WORLD_ADDRESS,
            )
            .await
            .expect("Failed to create torii client");

            let mut stream = torii
                .on_event_message_updated(
                    vec![EntityKeysClause::Keys(KeysClause {
                        keys: vec![Some(controller_address)],
                        pattern_matching: PatternMatching::FixedLen,
                        models: vec![],
                    })],
                    false,
                )
                .await
                .expect("Failed to subscribe to event messages");

            match create_game(&controller, contract_address.into(), nonce).await {
                Ok(_) => {
                    println!("Routine {}: Successfully executed create_game function", i);

                    while let Some(event) = stream.next().await {
                        if let Ok((_, entity)) = event {
                            dbg!(&entity);
                            if entity.hashed_keys != Felt::ZERO {
                                let game_created = entity
                                    .models
                                    .iter()
                                    .find(|m| m.name == "nums-GameCreated")
                                    .unwrap();
                                let game_id = game_created
                                    .children
                                    .iter()
                                    .find(|f| f.name == "game_id")
                                    .unwrap();
                                let game_id = game_id.ty.as_primitive().unwrap().as_u32().unwrap();
                                match set_slot(&controller, contract_address.into(), game_id, nonce)
                                    .await
                                {
                                    Ok(_) => {
                                        println!("Routine {}: Successfully executed set_slot function (game_id: {})", i, game_id);
                                    }
                                    Err(err) => {
                                        eprintln!("Routine {}: Failed to execute set_slot function (game_id: {}): {:?}", i, game_id, err);
                                    }
                                }
                            }
                        }
                    }
                }
                Err(err) => {
                    eprintln!(
                        "Routine {}: Failed to execute create_game function: {:?}",
                        i, err
                    );
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

    let r = controller.session_account(&Policy::from_calls(&[c.clone().into()]));

    let session_account = r.unwrap();

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

    let r = controller
        .provider
        .add_execute_outside_transaction(
            OutsideExecution::V3(exe),
            controller.address(),
            signed.signature,
        )
        .await;

    dbg!(&r);

    r
}

async fn set_slot(
    controller: &Controller,
    contract_address: ContractAddress,
    game_id: u32,
    nonce: (Felt, u128),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    // Can always set the slot 2 for testing, since the game has just been created.
    let target = Felt::TWO;

    let c = Call {
        to: contract_address,
        selector: selector!("set_slot"),
        calldata: vec![game_id.into(), target],
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
