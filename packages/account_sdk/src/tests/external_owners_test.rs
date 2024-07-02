use crate::{
    abigen::{controller::Controller, erc_20::Erc20},
    account::{
        session::{
            hash::{AllowedMethod, Session},
            raw_session::RawSession,
            SessionAccount,
        },
        CartridgeAccount, CartridgeGuardianAccount,
    },
    deploy_contract::FEE_TOKEN_ADDRESS,
    signers::{webauthn::internal::InternalWebauthnSigner, HashSigner},
    tests::{
        deployment_test::{deploy_two_helper, transfer_helper},
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
    transaction_waiter::TransactionWaiter,
};
use cainome::cairo_serde::{CairoSerde, ContractAddress, U256};
use starknet::{
    accounts::{Account, Call},
    core::types::{BlockId, BlockTag},
    macros::{felt, selector},
    providers::Provider,
    signers::SigningKey,
};

#[tokio::test]
async fn test_verify_external_owner() {
    let other = InternalWebauthnSigner::random("localhost".to_string(), "rp_id".to_string());
    let signer = SigningKey::from_random();
    let guardian_signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let (other_address, address) = deploy_two_helper(
        &runner,
        (&other, None as Option<&SigningKey>),
        (&signer, Some(&guardian_signer)),
    )
    .await;

    transfer_helper(&runner, &other_address).await;

    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let other_account = CartridgeAccount::new(
        runner.client(),
        other.clone(),
        other_address,
        runner.client().chain_id().await.unwrap(),
    );

    let account_interface = Controller::new(address, &account);

    let tx = account_interface.register_external_owner(&other_address.into());

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * 4u32.into();
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

    let session_signer = SigningKey::from_random();

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

    let tx = other_account.execute(vec![Call {
        to: address,
        selector: selector!("register_session"),
        calldata: <RawSession as CairoSerde>::cairo_serialize(&session.raw()),
    }]);

    let fee_estimate = tx.estimate_fee().await.unwrap().overall_fee * 4u32.into();
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
        guardian_signer,
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
