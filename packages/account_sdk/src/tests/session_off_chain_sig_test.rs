use core::panic;

use starknet::{
    core::{types::StarknetError, utils::get_selector_from_name},
    macros::selector,
    providers::ProviderError,
};
use starknet_crypto::{poseidon_hash_many, Felt};

use crate::{
    abigen::controller::ControllerReader,
    account::session::{policy::Policy, TypedData},
    artifacts::Version,
    signers::{Owner, Signer},
    tests::runners::katana::KatanaRunner,
};

pub async fn test_verify_session_off_chain_sig(owner: Owner) {
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let typed_data = (0..10)
        .map(|i| TypedData {
            type_hash: get_selector_from_name(&format!("Type{}", i)).unwrap(),
            typed_data_hash: poseidon_hash_many([&Felt::from(i), &Felt::from(i)]),
        })
        .collect::<Vec<_>>();

    let policies = typed_data.iter().map(Policy::from).collect::<Vec<_>>();

    let session_account = controller
        .create_session(policies.clone(), u64::MAX)
        .await
        .unwrap();

    let signature = session_account.sign_typed_data(&typed_data).await.unwrap();
    let contract_reader = ControllerReader::new(controller.address, runner.client());
    contract_reader
        .is_session_signature_valid(&typed_data, &signature)
        .call()
        .await
        .unwrap();
}

#[tokio::test]
#[cfg(feature = "webauthn")]
async fn test_verify_session_off_chain_sig_webauthn() {
    let signer = Signer::Webauthn(
        crate::signers::webauthn::WebauthnSigner::register(
            "cartridge.gg".to_string(),
            "username".to_string(),
            "challenge".as_bytes(),
        )
        .await
        .unwrap(),
    );

    test_verify_session_off_chain_sig(Owner::Signer(signer)).await;
}

#[tokio::test]
async fn test_verify_ession_off_chain_sig_starknet() {
    test_verify_session_off_chain_sig(Owner::Signer(Signer::new_starknet_random())).await;
}

#[tokio::test]
pub async fn test_verify_session_off_chain_sig_invalid_policy() {
    let owner = Owner::Signer(Signer::new_starknet_random());
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let typed_data = vec![
        TypedData {
            type_hash: selector!("Some type hash"),
            typed_data_hash: poseidon_hash_many([&Felt::ZERO, &Felt::ZERO]),
        },
        TypedData {
            type_hash: selector!("Some other type hash"),
            typed_data_hash: poseidon_hash_many([&Felt::ZERO, &Felt::ZERO]),
        },
    ];

    let policies = typed_data.iter().map(Policy::from).collect::<Vec<_>>();

    let session_account = controller
        .create_session(policies.clone(), u64::MAX)
        .await
        .unwrap();

    let mut signature = session_account.sign_typed_data(&typed_data).await.unwrap();
    dbg!(&signature);
    signature.proofs[0][0] += Felt::ONE;
    let contract_reader = ControllerReader::new(controller.address, runner.client());
    if let Err(cainome::cairo_serde::Error::Provider(ProviderError::StarknetError(
        StarknetError::ContractError(c),
    ))) = contract_reader
        .is_session_signature_valid(&typed_data, &signature)
        .call()
        .await
    {
        assert!(c.revert_error.contains("session/policy-check-failed"))
    } else {
        panic!("Expected ContractErrorData");
    }
}
