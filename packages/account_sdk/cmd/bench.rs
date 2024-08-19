use account_sdk::abigen::controller;
use account_sdk::abigen::controller::{Call, OutsideExecution};
use account_sdk::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use account_sdk::account::session::hash::AllowedMethod;
use account_sdk::controller::Controller;
use account_sdk::provider::{CartridgeJsonRpcProvider, CartridgeProvider};
use account_sdk::signers::HashSigner;
use account_sdk::storage::InMemoryBackend;

use cainome::cairo_serde::CairoSerde;
use starknet::core::utils::get_selector_from_name;
use starknet::macros::{felt, selector};
use starknet::signers::SigningKey;
use starknet_crypto::Felt;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{self, Duration};
use url::Url;

// Constants for TPS and duration
const TPS: usize = 25;
const DURATION_SECS: u64 = 30;

const BENCH_ACCOUNT: Felt =
    felt!("0x014679c1478a47f2fb378699f921517b0a4b412c9b7cec7348b1e0bb3efc42cf");

#[tokio::main]
async fn main() {
    let rpc_url = Url::parse("https://api.cartridge.gg/x/starknet/sepolia").unwrap();
    let chain_id = felt!("0x534e5f5345504f4c4941"); // Hex for "SN_SEPOLIA"

    let provider = CartridgeJsonRpcProvider::new(rpc_url);
    let signer = SigningKey::from_secret_scalar(felt!(
        "0x6b80fcafbecee2c7ddff50c9a09b529c8f65b2fdb457ea134e76ee17640d768"
    ));
    let username = "bench".to_owned();

    let mut controller = {
        let mut constructor_calldata = controller::Signer::cairo_serialize(&signer.signer());
        constructor_calldata.extend(Option::<controller::Signer>::cairo_serialize(&None));

        let guardian = SigningKey::from_random();

        Controller::new(
            "app_id".to_string(),
            username,
            provider.clone(),
            signer.clone(),
            guardian,
            BENCH_ACCOUNT,
            chain_id,
            InMemoryBackend::default(),
        )
    };

    let contract_address =
        felt!("0x77d04bd307605c021a1def7987278475342f4ea2581f7c49930e9269bedf476");

    let duration = Duration::from_secs(DURATION_SECS);
    let total_transactions = TPS * duration.as_secs() as usize;
    let interval = Duration::from_secs_f64(1.0 / TPS as f64);

    let mut handles = vec![];

    let _ = controller
        .create_session(
            vec![
                AllowedMethod::new(contract_address, selector!("flop")),
                AllowedMethod::new(contract_address, selector!("flip")),
            ],
            u32::MAX as u64,
        )
        .await
        .unwrap();

    let controller = Arc::new(Mutex::new(controller));
    for i in 0..total_transactions {
        let controller = Arc::clone(&controller);
        let handle = tokio::spawn(async move {
            let flop = Call {
                to: contract_address.into(),
                selector: get_selector_from_name("flop").unwrap(),
                calldata: vec![],
            };

            let controller = controller.lock().await;
            let session_account = controller.session_account(&[flop.clone().into()]).unwrap();

            let outside_execution = OutsideExecution {
                caller: OutsideExecutionCaller::Any.into(),
                execute_after: u64::MIN,
                execute_before: u32::MAX as u64,
                calls: vec![flop],
                nonce: SigningKey::from_random().secret_scalar(),
            };

            let signed = session_account
                .sign_outside_execution(outside_execution.clone())
                .await
                .unwrap();

            let result = controller
                .provider
                .add_execute_outside_transaction(outside_execution, BENCH_ACCOUNT, signed.signature)
                .await;

            match result {
                Ok(_) => {
                    println!("Routine {}: Successfully executed flop function", i);
                }
                Err(err) => {
                    eprintln!("Routine {}: Failed to execute flop function: {:?}", i, err);
                }
            }
        });

        handles.push(handle);
        time::sleep(interval).await;
    }

    for handle in handles {
        handle.await.unwrap();
    }
}
