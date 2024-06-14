use crate::{
    abigen::{
        cartridge_account::{CartridgeAccountReader, SignerType},
        erc_20::Erc20,
    },
    account::CartridgeAccount,
    deploy_contract::FEE_TOKEN_ADDRESS,
    signers::{webauthn::internal::InternalWebauthnSigner, HashSigner},
    tests::{
        deployment_test::deploy_helper,
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
    providers::Provider,
    signers::SigningKey,
};

use super::deployment_test::transfer_helper;

pub async fn test_deploy_owner_type<S: HashSigner + Clone>(
    signer: S,
    expected_signer_type: SignerType,
) {
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    let reader = CartridgeAccountReader::new(address, runner.client());

    let owner_type = reader
        .get_owner_type()
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .unwrap();

    assert_eq!(owner_type, expected_signer_type);
}

pub async fn test_verify_execute<S: HashSigner + Clone + Sync + Send>(signer: S) {
    let runner = KatanaRunner::load();
    let address = deploy_helper(&runner, &signer, None as Option<&SigningKey>).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeAccount::new(
        runner.client(),
        signer.clone(),
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
async fn test_deploy_owner_type_webauthn() {
    test_deploy_owner_type(
        InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string()),
        SignerType::Webauthn,
    )
    .await;
}

#[tokio::test]
async fn test_verify_execute_webautn() {
    test_verify_execute(InternalWebauthnSigner::random(
        "localhost".to_string(),
        "rp_id".to_string(),
    ))
    .await;
}

#[tokio::test]
async fn test_deploy_owner_type_starknet() {
    test_deploy_owner_type(SigningKey::from_random(), SignerType::Starknet).await;
}

#[tokio::test]
async fn test_verify_execute_starknet() {
    test_verify_execute(SigningKey::from_random()).await;
}
