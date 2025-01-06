use starknet::{
    accounts::{Account, ConnectedAccount},
    core::types::{BlockId, BlockTag},
    providers::Provider,
};

use crate::{
    artifacts::{Version, CONTROLLERS},
    signers::{Owner, Signer},
    tests::{ensure_txn, runners::katana::KatanaRunner},
};

#[tokio::test]
async fn test_controller_upgrade() {
    let runner = KatanaRunner::load();
    let signer = Signer::new_starknet_random();

    // Wait for Katana to be ready.
    // TODO: Do this with runner.
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;

    let controller = runner
        .deploy_controller(
            "username".to_owned(),
            Owner::Signer(signer),
            Version::V1_0_4,
        )
        .await;

    let hash = controller
        .provider()
        .get_class_hash_at(BlockId::Tag(BlockTag::Pending), controller.address())
        .await
        .unwrap();

    assert_eq!(hash, CONTROLLERS[&Version::V1_0_4].hash);

    runner.declare_controller(Version::LATEST).await;
    ensure_txn(
        controller
            .contract()
            .upgrade(&CONTROLLERS[&Version::LATEST].hash.into()),
        runner.client(),
    )
    .await
    .unwrap();

    let hash = controller
        .provider()
        .get_class_hash_at(BlockId::Tag(BlockTag::Pending), controller.address())
        .await
        .unwrap();

    assert_eq!(hash, CONTROLLERS[&Version::LATEST].hash);
}
