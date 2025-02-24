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
use anyhow::Result;
use clap::Parser;

use futures::StreamExt;
use starknet::accounts::{
    Account, AccountFactory, AccountFactoryError, ExecutionEncoding, SingleOwnerAccount,
};
use starknet::core::types::{BlockId, BlockTag, StarknetError};
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::macros::{felt, selector};
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::{JsonRpcClient, Provider, ProviderError};
use starknet::signers::{LocalWallet, SigningKey};
use starknet_crypto::Felt;
use std::primitive::{u32, u64};
use std::sync::Arc;
use tokio::time::Duration;
use torii_grpc::types::{EntityKeysClause, KeysClause, PatternMatching};
use url::Url;

// Controller setup.
const PRIVATE_KEY: Felt =
    felt!("0x6b80fcafbecee2c7ddff50c9a09b529c8f65b2fdb457ea134e76ee17640d768");

// Game setup.
const JACKPOT_ID_NONE: Felt = Felt::ONE;

// Chain setup.
// Hex for "WP_NUMS_APPCHAIN"
const CHAIN_ID: Felt = felt!("0x57505f4e554d535f415050434841494e");
const SERVICE_BASE_URL: &str = "https://api.cartridge.gg/x/nums-appchain";
const FEE_TOKEN_ADDRESS: Felt =
    felt!("0x2e7442625bab778683501c0eadbc1ea17b3535da040a12ac7d281066e915eea");

// Contracts setup.
const WORLD_ADDRESS: Felt =
    felt!("0x7686a16189676ac3978c3b865ae7e3d625a1cd7438800849c7fd866e4b9afd1");
const VRF_ADDRESS: Felt =
    felt!("0x7ed472bdde3b19a5cf2334ad0f368426272f477938270b1b04259f159bdc0e2");
const GAME_ADDRESS: Felt =
    felt!("0x0479895f8b2f1250c7eb28d8055b070942fca49bde45454662f4c9f60529d798");

// USe clap to aat least have the number of TPS and the duration from CLI
#[derive(Debug, Parser, Clone)]
struct Cli {
    #[arg(long, help = "The number of transactions per batch")]
    #[arg(default_value = "1")]
    pub ntxs: usize,

    #[arg(long, help = "The interval between each transaction batches in milliseconds")]
    #[arg(default_value = "1000")]
    pub interval: usize,

    #[arg(long, help = "The prefix for controllers usernames")]
    pub username_prefix: String,

    #[arg(
        long,
        help = "The address of the master account to pre-fund the controllers"
    )]
    #[arg(long, env = "MASTER_ACCOUNT_ADDRESS")]
    pub master_account_address: Felt,

    #[arg(
        long,
        help = "The private key of the master account to pre-fund the controllers"
    )]
    #[arg(long, env = "MASTER_ACCOUNT_PRIVATE_KEY")]
    pub master_account_private_key: Felt,
}

/// Entrypoint.
#[tokio::main]
async fn main() {
    let args = Cli::parse();
    let rpc_url = Url::parse(format!("{}/katana", SERVICE_BASE_URL).as_str()).unwrap();

    let signer = SigningKey::from_secret_scalar(PRIVATE_KEY);
    let owner = Owner::Signer(Signer::Starknet(signer.clone()));
    let master_account = create_sn_account(
        rpc_url.clone(),
        args.master_account_address,
        args.master_account_private_key,
    )
    .await;

    let master_account = Arc::new(master_account);

    let mut controllers = vec![];
    for i in 0..args.ntxs {
        let username = format!("{}__nb__{}", args.username_prefix, i);
        let salt = cairo_short_string_to_felt(username.as_str()).unwrap();

        let mut ctl = create_controller(
            rpc_url.clone(),
            &owner,
            &username,
            salt,
            CHAIN_ID,
            master_account.clone(),
        )
        .await;
        println!("Controller created {}: {:#x}", i, ctl.address());

        ctl.create_session(
            vec![
                Policy::new_call(GAME_ADDRESS, selector!("create_game")),
                Policy::new_call(GAME_ADDRESS, selector!("set_slot")),
                Policy::new_call(VRF_ADDRESS, selector!("request_random")),
            ],
            u32::MAX as u64,
        )
        .await
        .unwrap();

        controllers.push(Arc::new(ctl));
    }

    let interval = Duration::from_millis(args.interval as u64);
    dbg!(interval);

    let (namespace, bitmask) = (SigningKey::from_random().secret_scalar(), 0u128);
    let nonce_mutex = Arc::new(tokio::sync::Mutex::new((namespace, bitmask)));

    loop {
        let mut handles = vec![];

        for i in 0..args.ntxs {
            let controller = Arc::clone(&controllers[i]);
            let nonce_mutex = Arc::clone(&nonce_mutex);
            let handle = tokio::spawn(async move {
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
                            keys: vec![Some(controller.address())],
                            pattern_matching: PatternMatching::FixedLen,
                            models: vec!["nums-GameCreated".to_string()],
                        })],
                        false,
                    )
                    .await
                    .expect("Failed to subscribe to event messages");

                match create_game(&controller, get_nonce(&nonce_mutex).await).await {
                    Ok(_) => {
                        println!("Routine {}: Successfully executed create_game function", i);

                        while let Some(event) = stream.next().await {
                            if let Ok((_, entity)) = event {
                                if let Some(game_id) = entity.game_id() {
                                    match set_slot(
                                        &controller,
                                        game_id,
                                        get_nonce(&nonce_mutex).await,
                                    )
                                    .await
                                    {
                                        Ok(_) => {
                                            println!("Routine {}: Successfully executed set_slot function (game_id: {})", i, game_id);
                                            break;
                                        }
                                        Err(err) => {
                                            println!("Routine {}: Failed to execute set_slot function (game_id: {}): {:?}", i, game_id, err);
                                        }
                                    };
                                } else {
                                    // ignore the empty subscription response.
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
        }

        for handle in handles {
            handle.await.unwrap();
        }

        tokio::time::sleep(interval).await;
    }
}

/// Creates a game new game, the id will be emitted by gRPC in the `nums-GameCreated` event.
async fn create_game(
    controller: &Controller,
    nonce: (Felt, u128),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    let calls = vec![
        vrf_call(controller.address()),
        Call {
            to: GAME_ADDRESS.into(),
            selector: selector!("create_game"),
            calldata: vec![JACKPOT_ID_NONE],
        },
    ];

    let sdk_calls: Vec<starknet::core::types::Call> =
        calls.iter().map(|c| c.clone().into()).collect::<Vec<_>>();

    let r = controller.session_account(&Policy::from_calls(&sdk_calls));

    let session_account = r.unwrap();

    let exe = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls,
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

/// Sets the slot for a given game id.
async fn set_slot(
    controller: &Controller,
    game_id: u32,
    nonce: (Felt, u128),
) -> Result<ExecuteFromOutsideResponse, ExecuteFromOutsideError> {
    // Can always set the slot 2 for testing, since the game has just been created.
    let target = Felt::TWO;

    let calls = vec![
        vrf_call(controller.address()),
        Call {
            to: GAME_ADDRESS.into(),
            selector: selector!("set_slot"),
            calldata: vec![game_id.into(), target],
        },
    ];

    let sdk_calls: Vec<starknet::core::types::Call> =
        calls.iter().map(|c| c.clone().into()).collect::<Vec<_>>();

    let session_account = controller
        .session_account(&Policy::from_calls(&sdk_calls))
        .unwrap();

    let exe = OutsideExecutionV3 {
        caller: OutsideExecutionCaller::Any.into(),
        execute_after: 0,
        execute_before: u32::MAX as u64,
        calls,
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

/// Creates a VRF call to request a random number, to be inserted before each game call.
fn vrf_call(controller_contract_address: Felt) -> Call {
    Call {
        to: VRF_ADDRESS.into(),
        selector: selector!("request_random"),
        calldata: vec![GAME_ADDRESS.into(), Felt::ZERO, controller_contract_address],
    }
}

/// Computes the nonce for a given nonce context from the namespace and bitmask.
async fn get_nonce(nonce_mutex: &Arc<tokio::sync::Mutex<(Felt, u128)>>) -> (Felt, u128) {
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

    (namespace, nonce_bitmask)
}

/// A trait to extract the game id from the entity returned by Torii gRPC.
trait EntityGameCreated {
    fn game_id(&self) -> Option<u32>;
}

/// A trait to extract the game id from the entity to avoid big code above.
impl EntityGameCreated for torii_grpc::types::schema::Entity {
    fn game_id(&self) -> Option<u32> {
        if self.hashed_keys != Felt::ZERO {
            let game_created = self
                .models
                .iter()
                .find(|m| m.name == "nums-GameCreated")
                .unwrap();
            let game_id = game_created
                .children
                .iter()
                .find(|f| f.name == "game_id")
                .unwrap();

            Some(game_id.ty.as_primitive().unwrap().as_u32().unwrap())
        } else {
            None
        }
    }
}

/// Create a controller and deploys it with funding with the master account.
async fn create_controller(
    rpc_url: Url,
    owner: &Owner,
    username: &str,
    salt: Felt,
    chain_id: Felt,
    master_account: Arc<SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>>,
) -> Controller {
    let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());
    let factory = ControllerFactory::new(
        CONTROLLERS[&Version::V1_0_8].hash,
        CHAIN_ID,
        owner.clone(),
        provider,
    );

    let controller_address = factory.address(salt);

    let controller = Controller::new(
        "https://www.slot.nums.gg".to_string(),
        username.to_string(),
        CONTROLLERS[&Version::V1_0_8].hash,
        rpc_url,
        owner.clone(),
        controller_address,
        chain_id,
    );

    let _ = master_account
        .execute_v3(vec![starknet::core::types::Call {
            to: FEE_TOKEN_ADDRESS,
            selector: selector!("transfer"),
            calldata: vec![
                controller_address,
                Felt::from_dec_str("10000000000000000").unwrap(),
                Felt::ZERO,
            ],
        }])
        .send()
        .await
        .unwrap();

    // Wait for the transaction to included.
    tokio::time::sleep(Duration::from_secs(1)).await;

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
    };

    controller
}

/// Create a starknet account.
async fn create_sn_account(
    rpc_url: Url,
    address: Felt,
    private_key: Felt,
) -> SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet> {
    let provider = JsonRpcClient::new(HttpTransport::new(rpc_url));
    let chain_id = provider.chain_id().await.unwrap();
    let signer = LocalWallet::from(SigningKey::from_secret_scalar(private_key));

    let mut account =
        SingleOwnerAccount::new(provider, signer, address, chain_id, ExecutionEncoding::New);

    account.set_block_id(BlockId::Tag(BlockTag::Pending));

    account
}
