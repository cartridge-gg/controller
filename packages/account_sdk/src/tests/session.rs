use crate::{
    abigen::erc_20::Erc20,
    account::{
        session::{create::SessionCreator, hash::AllowedMethod},
        CartridgeGuardianAccount,
    },
    signers::HashSigner,
    tests::deploy_contract::FEE_TOKEN_ADDRESS,
    tests::runners::{katana_runner::KatanaRunner, TestnetRunner},
    tests::signers::InternalWebauthnSigner,
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};
use starknet_crypto::Felt;

use super::deployment_test::{deploy_helper, transfer_helper};

pub async fn test_verify_execute<
    S: HashSigner + Clone + Sync + Send,
    G: HashSigner + Clone + Sync + Send,
    Q: HashSigner + Clone + Sync + Send + 'static,
>(
    signer: S,
    guardian: G,
    session_signer: Q,
) {
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

    let account = guardian_account
        .session_account(
            session_signer,
            vec![
                AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
                AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfds")),
                AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfer")),
            ],
            u64::MAX,
        )
        .await
        .unwrap();

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

#[tokio::test]
async fn test_verify_execute_session_webauthn_starknet_starknet() {
    test_verify_execute(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        SigningKey::from_random(),
        SigningKey::from_random(),
    )
    .await;
}

#[ignore = "Not enough resources"]
#[tokio::test]
async fn test_verify_execute_session_webauthn_starknet_webauthn() {
    test_verify_execute(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        SigningKey::from_random(),
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_session_starknet_x3() {
    test_verify_execute(
        SigningKey::from_random(),
        SigningKey::from_random(),
        SigningKey::from_random(),
    )
    .await;
}
#[tokio::test]
async fn test_verify_execute_session_multiple() {
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

    let account = guardian_account
        .session_account(
            session_signer,
            vec![
                AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
                AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfds")),
                AllowedMethod::with_selector(*FEE_TOKEN_ADDRESS, selector!("transfer")),
            ],
            u64::MAX,
        )
        .await
        .unwrap();

    let new_account = ContractAddress(felt!("0x18301129"));

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &account);

    contract_erc20
        .balanceOf(&new_account)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    for i in 0u32..3 {
        let tx = contract_erc20.transfer(
            &new_account,
            &U256 {
                low: 0x1_u128,
                high: 0,
            },
        );
        let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * Felt::from(4u128);
        let tx = tx.nonce(i.into()).max_fee(fee_estimate).prepared().unwrap();

        let tx_hash = tx.transaction_hash(false);
        tx.send().await.unwrap();
        TransactionWaiter::new(tx_hash, runner.client())
            .wait()
            .await
            .unwrap();
    }
}
