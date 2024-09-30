use crate::{
    abigen::erc_20::Erc20,
    artifacts::Version,
    signers::{webauthn::WebauthnSigner, Signer},
    tests::{
        account::{webauthn::SoftPasskeySigner, FEE_TOKEN_ADDRESS},
        runners::katana::KatanaRunner,
    },
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
};

use super::ensure_txn;

pub async fn test_verify_execute(signer: Signer) {
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let new_account = ContractAddress(felt!("0x18301129"));

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller);

    contract_erc20
        .balanceOf(&new_account)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    ensure_txn(
        contract_erc20.transfer(
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
#[ignore = "Skipped due to exhausted resources"]
async fn test_verify_execute_webauthn() {
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
async fn test_verify_execute_starpair() {
    test_verify_execute(Signer::new_starknet_random()).await;
}
