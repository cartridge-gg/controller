use crate::{
    abigen::erc_20::Erc20,
    account::{
        session::{
            hash::{AllowedMethod, Session},
            SessionAccount,
        },
        SpecificAccount,
    },
    constants::Version,
    signers::{HashSigner, Signer, SignerTrait},
    tests::{account::FEE_TOKEN_ADDRESS, ensure_txn, runners::katana::KatanaRunner},
};
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    accounts::ConnectedAccount,
    core::types::{BlockId, BlockTag},
    macros::{felt, selector},
    providers::Provider,
};

#[tokio::test]
async fn test_verify_execute_session_registered() {
    let signer = Signer::new_starknet_random();
    let guardian_signer = Signer::new_starknet_random();
    let session_signer = Signer::new_starknet_random();

    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), signer.clone(), Version::LATEST)
        .await;

    let session = Session::new(
        vec![
            AllowedMethod::new(*FEE_TOKEN_ADDRESS, selector!("tdfs")),
            AllowedMethod::new(*FEE_TOKEN_ADDRESS, selector!("transfds")),
            AllowedMethod::new(*FEE_TOKEN_ADDRESS, selector!("transfer")),
        ],
        u64::MAX,
        &session_signer.signer(),
    )
    .unwrap();

    ensure_txn(
        controller
            .contract
            .register_session(&session.raw(), &signer.signer().guid()),
        controller.provider(),
    )
    .await
    .unwrap();

    let session_account = SessionAccount::new_as_registered(
        runner.client(),
        session_signer,
        guardian_signer,
        controller.address(),
        runner.client().chain_id().await.unwrap(),
        signer.signer().guid(),
        session,
    );

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
