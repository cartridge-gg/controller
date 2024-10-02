use crate::{
    abigen::erc_20::Erc20,
    account::session::{
        hash::{Policy, Session},
        SessionAccount,
    },
    artifacts::Version,
    signers::{webauthn::WebauthnSigner, HashSigner, Signer, SignerTrait},
    tests::{
        account::{webauthn::SoftPasskeySigner, FEE_TOKEN_ADDRESS},
        ensure_txn,
        runners::katana::KatanaRunner,
        transaction_waiter::TransactionWaiter,
    },
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    accounts::{Account, ConnectedAccount},
    core::types::{BlockId, BlockTag},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};
use starknet_crypto::Felt;

pub async fn test_verify_execute(signer: Signer) {
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let policies = vec![
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfds")),
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
    ];

    let session_account = controller
        .create_session(policies.clone(), u64::MAX)
        .await
        .unwrap();

    let recipient = ContractAddress(felt!("0x18301129"));
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    contract_erc20
        .balanceOf(&recipient)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    contract_erc20
        .transfer(
            &recipient,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_verify_execute_session_webauthn_starknet_starknet() {
    let signer = Signer::Webauthn(
        WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
            SoftPasskeySigner::new("https://cartridge.gg".try_into().unwrap()),
        )
        .await
        .unwrap(),
    );

    test_verify_execute(signer).await;
}

#[tokio::test]
async fn test_verify_execute_session_starknet_x3() {
    test_verify_execute(Signer::new_starknet_random()).await;
}

#[tokio::test]
async fn test_verify_execute_session_multiple() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let session_account = controller
        .create_session(
            vec![
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfds")),
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
            ],
            u64::MAX,
        )
        .await
        .unwrap();

    let recipient = ContractAddress(felt!("0x18301129"));
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    contract_erc20
        .balanceOf(&recipient)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    for _ in 0u32..3 {
        let tx = contract_erc20
            .transfer(
                &recipient,
                &U256 {
                    low: 0x1_u128,
                    high: 0,
                },
            )
            .send()
            .await
            .unwrap();

        TransactionWaiter::new(tx.transaction_hash, runner.client())
            .wait()
            .await
            .unwrap();
    }
}

#[tokio::test]
async fn test_verify_execute_session_registered() {
    let owner_signer = Signer::new_starknet_random();
    let session_signer = Signer::new_starknet_random();

    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), owner_signer.clone(), Version::LATEST)
        .await;

    let session = Session::new(
        vec![
            Policy::new(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
            Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfds")),
            Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        ],
        u64::MAX,
        &session_signer.signer(),
    )
    .unwrap();

    ensure_txn(
        controller
            .contract()
            .register_session(&session.raw(), &owner_signer.signer().guid()),
        controller.provider(),
    )
    .await
    .unwrap();

    let session_account = SessionAccount::new_as_registered(
        runner.client().clone(),
        session_signer,
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        owner_signer.signer().guid(),
        session,
    );

    let recipient = ContractAddress(felt!("0x18301129"));
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    contract_erc20
        .balanceOf(&recipient)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    contract_erc20
        .transfer(
            &recipient,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

#[tokio::test]
async fn test_create_and_use_registered_session() {
    let owner_signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner_signer.clone(), Version::LATEST)
        .await;

    // Create policies for the session
    let policies = vec![
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        Policy::new(*FEE_TOKEN_ADDRESS, selector!("approve")),
    ];

    // Generate a new key pair for the session
    let session_key = SigningKey::from_random();
    let session_signer = Signer::Starknet(session_key.clone());
    let public_key = session_key.verifying_key().scalar();

    // Register the session
    let expires_at = u64::MAX;
    let max_fee = Felt::from(277600000000000_u128);
    let txn = controller
        .register_session(policies.clone(), expires_at, public_key, max_fee)
        .await
        .expect("Failed to register session");

    TransactionWaiter::new(txn.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    // Create a SessionAccount using new_from_registered
    let session_account = SessionAccount::new_as_registered(
        runner.client().clone(),
        session_signer.clone(),
        controller.address(),
        controller.chain_id(),
        owner_signer.signer().guid(),
        Session::new(policies, expires_at, &session_signer.signer()).unwrap(),
    );

    // Use the session account to perform a transfer
    let recipient = ContractAddress(felt!("0x18301129"));
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &session_account);

    let tx = contract_erc20.transfer(
        &recipient,
        &U256 {
            low: 0x1_u128,
            high: 0,
        },
    );

    ensure_txn(tx, controller.provider()).await.unwrap();
}
