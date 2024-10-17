use crate::artifacts::Version;
use crate::signers::webauthn::WebauthnSigner;
use crate::signers::Signer;
use crate::tests::account::FEE_TOKEN_ADDRESS;
use crate::tests::runners::katana::KatanaRunner;
use crate::{abigen::erc_20::Erc20, signers::Owner};

use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
};

pub async fn test_verify_execute(owner: Owner) {
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;
    let new_account = ContractAddress(felt!("0x18301129"));
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller);

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
async fn test_verify_execute_webautn() {
    let signer = WebauthnSigner::register(
        "cartridge.gg".to_string(),
        "username".to_string(),
        "challenge".as_bytes(),
    )
    .await
    .unwrap();

    test_verify_execute(Owner::Signer(Signer::Webauthn(signer))).await;
}

#[tokio::test]
async fn test_verify_execute_starknet() {
    test_verify_execute(Owner::Signer(Signer::new_starknet_random())).await;
}
