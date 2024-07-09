use crate::{
    abigen::{controller::Controller, erc_20::Erc20},
    account::{
        session::{
            hash::{AllowedMethod, Session},
            SessionAccount,
        },
        CartridgeGuardianAccount,
    },
    deploy_contract::FEE_TOKEN_ADDRESS,
    signers::HashSigner,
    tests::runners::{katana_runner::KatanaRunner, TestnetRunner},
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag, Felt},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};

use super::deployment_test::{deploy_helper, transfer_helper};

#[tokio::test]
async fn test_verify_execute_session_registered() {
    let signer = SigningKey::from_random();
    let guardian = SigningKey::from_random();
    let session_signer = SigningKey::from_random();

    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, Some(&guardian)).await;

    transfer_helper(&runner, &address).await;

    let guardian_account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        guardian.clone(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let controller = Controller::new(address, &guardian_account);

    let session = Session::new(
        vec![
            AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
            AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfds")),
            AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        ],
        u64::MAX,
        &session_signer.signer(),
    )
    .unwrap();

    let tx = controller.register_session(&session.raw());

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * Felt::from(4u128);
    let tx = tx
        .nonce(0u32.into())
        .max_fee(fee_estimate)
        .prepared()
        .unwrap();

    let tx_hash = tx.transaction_hash(false);
    tx.send().await.unwrap();
    TransactionWaiter::new(tx_hash, runner.client())
        .wait()
        .await
        .unwrap();

    let account = SessionAccount::new(
        runner.client(),
        session_signer,
        guardian,
        address,
        runner.client().chain_id().await.unwrap(),
        vec![],
        session,
    );

    let new_account = ContractAddress(felt!("0x18301129"));

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &account);

    contract_erc20
        .balanceOf(&new_account)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    contract_erc20
        .transfer(
            &new_account,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}
