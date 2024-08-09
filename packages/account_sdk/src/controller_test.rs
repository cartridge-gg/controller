use std::time::Duration;

use crate::{
    controller::Controller, storage::InMemoryBackend, tests::runners::katana::KatanaRunner,
    transaction_waiter::TransactionWaiter,
};
use starknet::{accounts::Account, macros::felt, providers::Provider, signers::SigningKey};

#[tokio::test]
async fn test_deploy_controller() {
    let runner = KatanaRunner::load();
    runner.declare_controller().await;

    // Create signers
    let owner = SigningKey::from_secret_scalar(felt!(
        "0x3e5e410f88f88e77d18a168259a8feb6a68b358c813bdca08c875c8e54d0bf2"
    ));
    let guardian_signer = SigningKey::from_secret_scalar(felt!(
        "0x3e5e410f88f88e77d18a168259a8feb6a68b358c813bdca08c875c8e54d0bf2"
    ));

    let provider = runner.client();
    let backend = InMemoryBackend::default();

    // Create a new Controller instance
    let username = "testuser".to_string();
    let address = felt!("0x47b0710252f3eb7bea6124534a41e03b641fddcb48c57e2dc63b009cb2a725a");
    let chain_id = provider.chain_id().await.unwrap();

    let controller = Controller::new(
        "app_id".to_string(),
        username.clone(),
        provider.clone(),
        owner.clone(),
        guardian_signer.clone(),
        address,
        chain_id,
        backend,
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
