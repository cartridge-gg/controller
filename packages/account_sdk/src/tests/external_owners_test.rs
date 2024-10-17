use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::{
    accounts::Account,
    core::types::Call,
    macros::{felt, selector},
    providers::Provider,
};
use starknet_crypto::Felt;

use crate::{
    abigen::erc_20::Erc20,
    account::session::{
        hash::{Policy, Session},
        raw_session::RawSession,
        SessionAccount,
    },
    artifacts::Version,
    signers::{Owner, Signer},
    tests::{account::FEE_TOKEN_ADDRESS, ensure_txn, runners::katana::KatanaRunner},
};

#[tokio::test]
async fn test_verify_external_owner() {
    let runner = KatanaRunner::load();
    let signer = Signer::new_starknet_random();
    let external_account = runner.executor().await;
    let controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::LATEST,
        )
        .await;

    ensure_txn(
        controller
            .contract()
            .register_external_owner(&external_account.address().into()),
        runner.client(),
    )
    .await
    .unwrap();

    let session_signer = Signer::new_starknet_random();
    let session = Session::new(
        vec![Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer"))],
        u64::MAX,
        &session_signer.clone().into(),
        Felt::ZERO,
    )
    .unwrap();

    ensure_txn(
        external_account.execute_v1(vec![Call {
            to: controller.address(),
            selector: selector!("register_session"),
            calldata: [
                <RawSession as CairoSerde>::cairo_serialize(&session.raw()),
                vec![external_account.address()],
            ]
            .concat(),
        }]),
        runner.client(),
    )
    .await
    .unwrap();

    let session = SessionAccount::new_as_registered(
        runner.client().clone(),
        session_signer,
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        external_account.address(),
        session,
    );

    let new_account = ContractAddress(felt!("0x18301129"));

    ensure_txn(
        Erc20::new(*FEE_TOKEN_ADDRESS, &session).transfer(
            &new_account,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        ),
        runner.client(),
    )
    .await
    .unwrap();
}

#[tokio::test]
async fn test_verify_constructor_external_owner() {
    let runner = KatanaRunner::load();
    let external_account = runner.executor().await;
    let controller = runner
        .deploy_controller(
            "external_owner".to_string(),
            Owner::Account(external_account.address()),
            Version::LATEST,
        )
        .await;

    let session_signer = Signer::new_starknet_random();
    let session = Session::new(
        vec![Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer"))],
        u64::MAX,
        &session_signer.clone().into(),
        Felt::ZERO,
    )
    .unwrap();

    ensure_txn(
        external_account.execute_v1(vec![Call {
            to: controller.address(),
            selector: selector!("register_session"),
            calldata: [
                <RawSession as CairoSerde>::cairo_serialize(&session.raw()),
                vec![external_account.address()],
            ]
            .concat(),
        }]),
        runner.client(),
    )
    .await
    .unwrap();

    let session = SessionAccount::new_as_registered(
        runner.client().clone(),
        session_signer,
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        external_account.address(),
        session,
    );

    let new_account = ContractAddress(felt!("0x18301129"));

    ensure_txn(
        Erc20::new(*FEE_TOKEN_ADDRESS, &session).transfer(
            &new_account,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        ),
        runner.client(),
    )
    .await
    .unwrap();
}
