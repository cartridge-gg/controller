use crate::{
    abigen::erc_20::Erc20,
    account::CartridgeGuardianAccount,
    signers::HashSigner,
    tests::deploy_contract::FEE_TOKEN_ADDRESS,
    tests::runners::{katana_runner::KatanaRunner, TestnetRunner},
    tests::signers::InternalWebauthnSigner,
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
    providers::Provider,
    signers::SigningKey,
};

use super::deployment_test::{deploy_helper, transfer_helper};

pub async fn test_verify_execute<
    S: HashSigner + Clone + Sync + Send,
    G: HashSigner + Clone + Sync + Send,
>(
    signer: S,
    guardian: G,
) {
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, Some(&guardian)).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        guardian,
        address,
        runner.client().chain_id().await.unwrap(),
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

#[tokio::test]
async fn test_verify_execute_webauthn_guardian_starknet() {
    test_verify_execute(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        SigningKey::from_random(),
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_starknet_guardian_starknet() {
    test_verify_execute(SigningKey::from_random(), SigningKey::from_random()).await;
}
