use starknet::macros::selector;
use starknet_crypto::{poseidon_hash_many, Felt};

use crate::{
    abigen::controller::ControllerReader,
    account::session::{
        hash::{Policy, TypedDataPolicy},
        TypedData,
    },
    artifacts::Version,
    signers::{Owner, Signer},
    tests::runners::katana::KatanaRunner,
};

pub async fn test_verify_execute(owner: Owner) {
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let typed_data = vec![TypedData {
        type_hash: selector!("Some type hash"),
        typed_data_hash: poseidon_hash_many([&Felt::ZERO, &Felt::ZERO]),
    }];

    let policies = typed_data
        .iter()
        .map(TypedDataPolicy::from)
        .map(Policy::from)
        .collect::<Vec<_>>();

    let session_account = controller
        .create_session(policies.clone(), u64::MAX)
        .await
        .unwrap();

    let signature = session_account.sign_typed_data(&typed_data).await.unwrap();
    let contract_reader = ControllerReader::new(controller.address, runner.client());
    contract_reader
        .is_session_sigature_valid(&typed_data, &signature)
        .call()
        .await
        .unwrap();
}

#[tokio::test]
#[cfg(feature = "webauthn")]
async fn test_verify_session_off_chain_sig() {
    let signer = Signer::Webauthn(
        crate::signers::webauthn::WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
        )
        .await
        .unwrap(),
    );

    test_verify_execute(Owner::Signer(signer)).await;
}
