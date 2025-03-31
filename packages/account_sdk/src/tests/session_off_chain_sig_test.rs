use core::panic;

use starknet::{
    core::{types::StarknetError, utils::get_selector_from_name},
    macros::{selector, short_string},
    providers::ProviderError,
};
use starknet_crypto::{poseidon_hash, poseidon_hash_many, Felt};

use crate::{
    abigen::controller::ControllerReader,
    account::session::{policy::Policy, TypedData as AbiTypedData},
    artifacts::Version,
    signers::{Owner, Signer},
    tests::runners::katana::KatanaRunner,
    typed_data::{Domain, Field, PrimitiveType, SimpleField, TypedData},
};

const SESSION_TYPED_DATA_MAGIC: Felt = short_string!("session-typed-data");

pub async fn test_verify_session_off_chain_sig(owner: Owner) {
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
        .await;

    let typed_data = (0..10)
        .map(|i| AbiTypedData {
            scope_hash: get_selector_from_name(&format!("Type{}", i)).unwrap(),
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
        AbiTypedData {
            scope_hash: selector!("Some type hash"),
            typed_data_hash: poseidon_hash_many([&Felt::ZERO, &Felt::ZERO]),
        },
        AbiTypedData {
            scope_hash: selector!("Some other type hash"),
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

#[tokio::test]
pub async fn test_session_off_chain_sig_via_controller() {
    let owner = Owner::Signer(Signer::new_starknet_random());
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), owner.clone(), Version::LATEST)
        .await;

    let typed_data = TypedData {
        types: [
            (
                "StarknetDomain".into(),
                vec![
                    Field::SimpleType(SimpleField {
                        name: "name".into(),
                        r#type: "shortstring".into(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "version".into(),
                        r#type: "shortstring".into(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "chainId".into(),
                        r#type: "shortstring".into(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "revision".into(),
                        r#type: "shortstring".into(),
                    }),
                ],
            ),
            (
                "Person".into(),
                vec![
                    Field::SimpleType(SimpleField {
                        name: "name".into(),
                        r#type: "felt".into(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "wallet".into(),
                        r#type: "felt".into(),
                    }),
                ],
            ),
            (
                "Mail".into(),
                vec![
                    Field::SimpleType(SimpleField {
                        name: "from".into(),
                        r#type: "Person".into(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "to".into(),
                        r#type: "Person".into(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "contents".into(),
                        r#type: "felt".into(),
                    }),
                ],
            ),
        ]
        .into_iter()
        .collect(),
        primary_type: "Mail".into(),
        domain: Domain {
            name: "StarkNet Mail".into(),
            version: "1".into(),
            chain_id: "1".into(),
            revision: Some("1".into()),
        },
        message: [
            (
                "from".into(),
                PrimitiveType::Object(
                    [
                        ("name".into(), PrimitiveType::String("Cow".into())),
                        (
                            "wallet".into(),
                            PrimitiveType::String(
                                "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826".into(),
                            ),
                        ),
                    ]
                    .into_iter()
                    .collect(),
                ),
            ),
            (
                "to".into(),
                PrimitiveType::Object(
                    [
                        ("name".into(), PrimitiveType::String("Bob".into())),
                        (
                            "wallet".into(),
                            PrimitiveType::String(
                                "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB".into(),
                            ),
                        ),
                    ]
                    .into_iter()
                    .collect(),
                ),
            ),
            (
                "contents".into(),
                PrimitiveType::String("Hello, Bob!".into()),
            ),
        ]
        .into_iter()
        .collect(),
    };

    let hashes = typed_data.encode(controller.address).unwrap();
    controller
        .create_session(
            vec![Policy::new_typed_data(poseidon_hash(
                hashes.domain_separator_hash,
                hashes.type_hash,
            ))],
            u64::MAX,
        )
        .await
        .unwrap();

    let signature = controller.sign_message(typed_data.clone()).await.unwrap();
    assert_eq!(signature[0], SESSION_TYPED_DATA_MAGIC);

    let contract_reader = ControllerReader::new(controller.address, runner.client());
    let is_valid = contract_reader
        .is_valid_signature(&hashes.hash, &signature)
        .call()
        .await
        .unwrap();

    assert_ne!(is_valid, Felt::ZERO);

    let mut wildcard_controller = runner
        .deploy_controller("wildcard".to_owned(), owner, Version::LATEST)
        .await;
    let wildcard_hashes = typed_data.encode(wildcard_controller.address).unwrap();

    wildcard_controller
        .create_wildcard_session(u64::MAX)
        .await
        .unwrap();

    let signature = wildcard_controller.sign_message(typed_data).await.unwrap();
    assert_eq!(signature[0], SESSION_TYPED_DATA_MAGIC);

    let contract_reader = ControllerReader::new(wildcard_controller.address, runner.client());
    let is_valid = contract_reader
        .is_valid_signature(&wildcard_hashes.hash, &signature)
        .call()
        .await
        .unwrap();

    assert_ne!(is_valid, Felt::ZERO);
}
