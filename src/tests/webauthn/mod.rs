mod utils;
use crate::{
    abigen::{cartridge_account::SignerType, erc_20::Erc20},
    tests::runners::katana_runner::KatanaRunner,
    webauthn_signer::signers::p256r1::P256r1Signer,
};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
};

#[tokio::test]
async fn test_deploy_with_webauthn_owner() {
    let rp_id = "rp_id".to_string();
    let origin = "localhost".to_string();
    let signer = P256r1Signer::random(origin.clone(), rp_id.clone());

    let data = utils::WebauthnTestData::<KatanaRunner>::new(signer).await;
    let reader = data.cartridge_account_reader();

    let owner_type = reader
        .get_owner_type()
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .unwrap();

    assert_eq!(owner_type, SignerType::Webauthn);
}

#[tokio::test]
async fn test_verify_webauthn_execute() {
    let rp_id = "rp_id".to_string();
    let origin = "localhost".to_string();
    let signer = P256r1Signer::random(origin.clone(), rp_id.clone());
    let data = utils::WebauthnTestData::<KatanaRunner>::new(signer).await;

    let webauthn_executor = data.cartridge_account().await;

    let result = webauthn_executor.test_authenticate().send().await;

    result.unwrap();
}

#[tokio::test]
async fn test_webauthn_transfer() {
    use crate::deploy_contract::FEE_TOKEN_ADDRESS;
    use cainome::cairo_serde::{ContractAddress, U256};
    let rp_id = "rp_id".to_string();
    let origin = "localhost".to_string();
    let signer = P256r1Signer::random(origin.clone(), rp_id.clone());
    let data = utils::WebauthnTestData::<KatanaRunner>::new(signer).await;
    let account = data.webauthn_account().await;
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
