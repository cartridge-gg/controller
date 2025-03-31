use cainome::cairo_serde::{ContractAddress, U256};
use cainome_cairo_serde::Zeroable;
use starknet::{
    accounts::{Account, AccountError, ConnectedAccount},
    core::types::{
        BlockId, BlockTag, FeeEstimate, PriceUnit, StarknetError, TransactionExecutionErrorData,
    },
    macros::{felt, selector},
    providers::{Provider, ProviderError},
    signers::SigningKey,
};
use starknet_crypto::Felt;

use crate::{
    abigen::{self, erc_20::Erc20},
    account::session::{account::SessionAccount, hash::Session, policy::Policy},
    artifacts::Version,
    constants::GUARDIAN_SIGNER,
    hash::MessageHashRev1,
    signers::{Owner, Signer},
    tests::{
        account::FEE_TOKEN_ADDRESS, ensure_txn, runners::katana::KatanaRunner,
        transaction_waiter::TransactionWaiter,
    },
};

pub async fn test_verify_execute(owner: Owner) {
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let policies = vec![
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfds")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
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
#[cfg(feature = "webauthn")]
async fn test_verify_execute_session_webauthn_starknet_starknet() {
    let signer = Signer::Webauthn(
        crate::signers::webauthn::WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
        )
        .await
        .unwrap(),
    );

    test_verify_execute(Owner::Signer(signer)).await;
}

#[tokio::test]
async fn test_verify_execute_session_starknet_x3() {
    test_verify_execute(Owner::Signer(Signer::new_starknet_random())).await;
}

#[tokio::test]
async fn test_verify_execute_session_multiple() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    let session_account = controller
        .create_session(
            vec![
                Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
                Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfds")),
                Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
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
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(owner_signer.clone()),
            Version::LATEST,
        )
        .await;

    let session = Session::new(
        vec![
            Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
            Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfds")),
            Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        ],
        u64::MAX,
        &session_signer.clone().into(),
        Felt::ZERO,
    )
    .unwrap();

    ensure_txn(
        controller
            .contract()
            .register_session(&session.clone().into(), &owner_signer.clone().into()),
        controller.provider(),
    )
    .await
    .unwrap();

    let session_account = SessionAccount::new_as_registered(
        runner.client().clone(),
        session_signer,
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        owner_signer.into(),
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
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(owner_signer.clone()),
            Version::LATEST,
        )
        .await;

    // Create policies for the session
    let policies = vec![
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("approve")),
    ];

    // Generate a new key pair for the session
    let session_key = SigningKey::from_random();
    let session_signer = Signer::Starknet(session_key.clone());
    let public_key = session_key.verifying_key().scalar();

    // Register the session
    let expires_at = u64::MAX;
    let max_fee = FeeEstimate {
        gas_consumed: Felt::ZERO,
        gas_price: Felt::from(20000000000_u128),
        overall_fee: Felt::from(57780000000000_u128),
        data_gas_consumed: Felt::ZERO,
        data_gas_price: Felt::ZERO,
        unit: PriceUnit::Fri,
    };
    let txn = controller
        .register_session(
            policies.clone(),
            expires_at,
            public_key,
            Felt::ZERO,
            Some(max_fee),
        )
        .await
        .expect("Failed to register session");

    TransactionWaiter::new(txn.transaction_hash, runner.client())
        .wait()
        .await
        .unwrap();

    let session = Session::new(
        policies,
        expires_at,
        &session_signer.clone().into(),
        Felt::ZERO,
    )
    .unwrap();

    // Create a SessionAccount using new_from_registered
    let session_account = SessionAccount::new_as_registered(
        runner.client().clone(),
        session_signer.clone(),
        controller.address(),
        controller.chain_id(),
        owner_signer.clone().into(),
        session.clone(),
    );

    let is_registered =
        abigen::controller::ControllerReader::new(controller.address(), runner.client())
            .is_session_registered(
                &session
                    .inner
                    .get_message_hash_rev_1(controller.chain_id, controller.address),
                &owner_signer.into(),
            )
            .call()
            .await
            .unwrap();
    assert!(is_registered);

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

#[tokio::test]
pub async fn test_verify_execute_with_guardian() {
    let owner = Owner::Signer(Signer::new_starknet_random());
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let policies = vec![
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfds")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
    ];

    let session_account = controller
        .create_session_with_guardian(policies.clone(), u64::MAX, GUARDIAN_SIGNER.into())
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
pub async fn test_verify_execute_with_invalid_guardian() {
    let owner = Owner::Signer(Signer::new_starknet_random());
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let policies = vec![
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfds")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
    ];

    let session_account = controller
        .create_session_with_guardian(policies.clone(), u64::MAX, Felt::ONE)
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

    let res = contract_erc20
        .transfer(
            &recipient,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await;

    assert!(
        matches!(
            res,
            Err(AccountError::Provider(ProviderError::StarknetError(
                StarknetError::TransactionExecutionError(TransactionExecutionErrorData {
                    execution_error,
                    ..
                })
            ))) if execution_error.contains("session/invalid-guardian")
        ),
        "Should return error"
    );
}

#[tokio::test]
async fn test_verify_execute_session_wildcard() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    let signer = SigningKey::from_random();
    let session_signer = Signer::Starknet(signer.clone());
    let session = Session::new_wildcard(u64::MAX, &session_signer.into(), Felt::ZERO).unwrap();

    let session_account = controller
        .create_with_session(signer, session)
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

#[tokio::test]
async fn test_verify_session_signature_valid() {
    let owner = Owner::Signer(Signer::new_starknet_random());
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let policies = vec![
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        Policy::new_call(*FEE_TOKEN_ADDRESS, selector!("approve")),
    ];

    // Create a session
    let session_account = controller
        .create_session(policies.clone(), u64::MAX)
        .await
        .unwrap();

    // Get the session hash
    let session_hash = session_account
        .session
        .inner
        .get_message_hash_rev_1(controller.chain_id, controller.address);

    // Check if the session signature is valid using the contract's is_session_signature_valid method
    let is_valid = abigen::controller::ControllerReader::new(controller.address(), runner.client())
        .is_valid_signature(&session_hash, &session_account.session_authorization)
        .call()
        .await
        .unwrap();

    assert!(!is_valid.is_zero(), "Session signature should be valid");
}
