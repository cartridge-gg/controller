use crate::{
    abigen::erc_20::Erc20,
    account::{
        session::{create::SessionCreator, hash::AllowedMethod},
        CartridgeGuardianAccount,
    },
    deploy_contract::FEE_TOKEN_ADDRESS,
    signers::{webauthn::P256r1Signer, HashSigner},
    tests::{
        deployment_test::{declare, deploy},
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};
use starknet_crypto::FieldElement;

async fn deploy_helper<R: TestnetRunner, S: HashSigner + Clone, G: HashSigner + Clone>(
    runner: &R,
    signer: &S,
    guardian: &G,
) -> FieldElement {
    let prefunded = runner.prefunded_single_owner_account().await;
    let class_hash = declare(runner.client(), &prefunded).await;

    deploy(
        runner.client(),
        &prefunded,
        signer.signer(),
        Some(guardian.signer()),
        class_hash,
    )
    .await
}

async fn transfer_helper<R: TestnetRunner>(runner: &R, address: &FieldElement) {
    let prefunded = runner.prefunded_single_owner_account().await;
    let erc20_prefunded = Erc20::new(*FEE_TOKEN_ADDRESS, prefunded);

    erc20_prefunded
        .transfer(
            &ContractAddress(*address),
            &U256 {
                low: 0x8944000000000000_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

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
    let address = deploy_helper(&runner, &signer, &guardian).await;

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
        P256r1Signer::random("localhost".to_string(), "rp_id".to_string()),
        SigningKey::from_random(),
        SigningKey::from_random(),
    )
    .await;
}

#[ignore = "Not enough resources"]
#[tokio::test]
async fn test_verify_execute_session_webauthn_starknet_webauthn() {
    test_verify_execute(
        P256r1Signer::random("localhost".to_string(), "rp_id".to_string()),
        SigningKey::from_random(),
        P256r1Signer::random("localhost".to_string(), "rp_id".to_string()),
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
