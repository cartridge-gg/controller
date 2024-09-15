use crate::{
    abigen::erc_20::Erc20,
    account::session::{create::SessionCreator, hash::Policy},
    constants::Version,
    signers::{webauthn::WebauthnSigner, Signer},
    tests::{
        account::{webauthn::SoftPasskeySigner, FEE_TOKEN_ADDRESS},
        runners::katana::KatanaRunner,
    },
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::{felt, selector},
};

pub async fn test_verify_execute(signer: Signer, session_signer: Signer) {
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let session_account = controller
        .account
        .session_account(
            session_signer,
            vec![
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfds")),
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
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
async fn test_verify_execute_session_webauthn_starknet_starknet() {
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

    test_verify_execute(signer, Signer::new_starknet_random()).await;
}

#[tokio::test]
async fn test_verify_execute_session_starknet_x3() {
    test_verify_execute(Signer::new_starknet_random(), Signer::new_starknet_random()).await;
}

#[tokio::test]
async fn test_verify_execute_session_multiple() {
    let signer = Signer::new_starknet_random();
    let session_signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let session_account = controller
        .account
        .session_account(
            session_signer,
            vec![
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfds")),
                Policy::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
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
