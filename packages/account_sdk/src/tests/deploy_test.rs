use crate::account::session::hash::AllowedMethod;
use crate::account::DEPLOY_SELECTOR;
use crate::tests::deploy_contract::AccountDeclaration;
use crate::{account::session::create::SessionCreator, tests::deploy_contract::AccountDeployment};
use cainome::cairo_serde::{ByteArray, CairoSerde, U256};
use starknet::core::types::DeclareTransactionResult;
use starknet::{providers::Provider, signers::SigningKey};
use starknet_crypto::Felt;

use crate::{
    account::CartridgeGuardianAccount,
    tests::{
        deployment_test::{deploy_helper, transfer_helper},
        runners::{katana_runner::KatanaRunner, TestnetRunner},
    },
};

#[tokio::test]
async fn test_deploy_using_account() {
    let signer = SigningKey::from_random();
    let runner = KatanaRunner::load();
    let controller = runner.deploy_controller(&signer).await;

    transfer_helper(&runner, &address).await;

    let account = CartridgeGuardianAccount::new(
        runner.client(),
        signer.clone(),
        SigningKey::from_random(),
        address,
        runner.client().chain_id().await.unwrap(),
    );

    let DeclareTransactionResult { class_hash, .. } = AccountDeclaration::erc_20(runner.client())
        .declare(&account)
        .await
        .unwrap()
        .wait_for_completion()
        .await;

    AccountDeployment::new(runner.client())
        .deploy(
            {
                let mut vec = Vec::new();
                vec.extend(ByteArray::cairo_serialize(
                    &ByteArray::from_string("name").unwrap(),
                ));
                vec.extend(ByteArray::cairo_serialize(
                    &ByteArray::from_string("symbol").unwrap(),
                ));
                vec.extend(U256::cairo_serialize(&U256 {
                    low: 1_u128,
                    high: 1_u128,
                }));
                vec.push(address);
                vec.push(address);
                vec
            },
            Felt::ZERO,
            &account,
            class_hash,
        )
        .await
        .unwrap()
        .wait_for_completion()
        .await;
}
