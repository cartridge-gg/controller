use std::time::Duration;

use crate::{
    artifacts::{Version, CONTROLLERS},
    controller::Controller,
    signers::Signer,
    tests::{runners::katana::KatanaRunner, transaction_waiter::TransactionWaiter},
};
use starknet::{accounts::Account, macros::felt, providers::Provider, signers::SigningKey};
use starknet_crypto::Felt;

#[tokio::test]
async fn test_deploy_controller() {
    let runner = KatanaRunner::load();
    dbg!(runner.declare_controller(Version::V1_0_4).await);

    // Create signers
    let owner = Signer::Starknet(SigningKey::from_secret_scalar(felt!(
        "0x3e5e410f88f88e77d18a168259a8feb6a68b358c813bdca08c875c8e54d0bf2"
    )));

    let provider = runner.client();
    let chain_id = provider.chain_id().await.unwrap();

    // Create a new Controller instance
    let username = "testuser".to_string();

    // This is only done to calculate the address
    // The code duplication allows for the address not to be hardcoded
    let address = Controller::new(
        "app_id".to_string(),
        username.clone(),
        CONTROLLERS[&Version::V1_0_4].hash,
        runner.rpc_url.clone(),
        owner.clone(),
        Felt::ZERO,
        chain_id,
    )
    .deploy()
    .address();

    let controller = Controller::new(
        "app_id".to_string(),
        username.clone(),
        CONTROLLERS[&Version::V1_0_4].hash,
        runner.rpc_url.clone(),
        owner.clone(),
        address,
        chain_id,
    );

    let deploy = controller.deploy();
    assert_eq!(address, deploy.address());

    runner.fund(&address).await;

    // Deploy the controller
    let deploy_result = deploy.fee_estimate_multiplier(1.5).send().await.unwrap();

    // Wait for the transaction to be mined
    TransactionWaiter::new(deploy_result.transaction_hash, &provider.clone())
        .with_timeout(Duration::from_secs(5))
        .wait()
        .await
        .unwrap();

    // Verify the deployment
    let deployed_address = controller.address();
    assert_eq!(
        deployed_address, address,
        "Deployed address doesn't match expected address"
    );
}
