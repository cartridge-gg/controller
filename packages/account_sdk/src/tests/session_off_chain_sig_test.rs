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
        .deploy_controller("username".to_owned(), owner, Version::LATEST)
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

    let signature = controller.sign_message(typed_data).await.unwrap();
    assert_eq!(signature[0], SESSION_TYPED_DATA_MAGIC);

    let contract_reader = ControllerReader::new(controller.address, runner.client());
    let is_valid = contract_reader
        .is_valid_signature(&hashes.hash, &signature)
        .call()
        .await
        .unwrap();

    assert_ne!(is_valid, Felt::ZERO);
}

#[tokio::test]
pub async fn test_deserialize_session_typed_data_signature() {
    use crate::abigen::controller::{SessionToken, TypedData as AbiTypedData};
    use crate::typed_data::{Domain, Field, PrimitiveType, SimpleField, TypedData};
    use cainome::cairo_serde::{CairoSerde, Result as CairoSerdeResult};
    use starknet::core::types::Felt;

    // Define DetailedTypedData struct similar to the one in controller.rs
    #[derive(Debug, Clone)]
    struct DetailedTypedData {
        domain_hash: Felt,
        type_hash: Felt,
        params: Vec<Felt>,
    }

    impl CairoSerde for DetailedTypedData {
        type RustType = Self;

        fn cairo_serialized_size(rust: &Self::RustType) -> usize {
            2 + 1 + rust.params.len() // domain_hash + type_hash + params_len + params
        }

        fn cairo_serialize(rust: &Self::RustType) -> Vec<Felt> {
            let mut result = vec![
                rust.domain_hash,
                rust.type_hash,
                Felt::from(rust.params.len()),
            ];
            result.extend_from_slice(&rust.params);
            result
        }

        fn cairo_deserialize(felts: &[Felt], offset: usize) -> CairoSerdeResult<Self::RustType> {
            let domain_hash = felts[offset];
            let type_hash = felts[offset + 1];
            let params_len: usize = felts[offset + 2].try_into().unwrap();

            let params = felts[offset + 3..offset + 3 + params_len].to_vec();

            Ok(DetailedTypedData {
                domain_hash,
                type_hash,
                params,
            })
        }
    }

    // The signature array from the JSON
    let signature = vec![
        Felt::from_hex("0x000000000000000000000000000073657373696f6e2d74797065642d64617461")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000001")
            .unwrap(),
        Felt::from_hex("0x06b3fb73a2987cb5839b7ae75fa4007e025743e03d6ec3b4680de31ba7d39790")
            .unwrap(),
        Felt::from_hex("0x01ee3af7009cf93bf3985bc8c146451dfd1de5b4e1a5178d4789a59b417927cc")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000002")
            .unwrap(),
        Felt::from_hex("0x07d0b0d926ae74bbd772419c113c3eb93ad0ee171f16a7fd5f73ca7aa470df57")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000067d1da70")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000067d97493")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000077696c64636172642d706f6c696379")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
        Felt::from_hex("0x0533b504eb731e56b029808e78991408165e2c90a534f1a1bc506db47280d481")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000001")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000003a")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000001")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000004")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000016")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000068")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000074")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000074")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000070")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000073")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000003a")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000002f")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000002f")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000078")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000002e")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000063")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000061")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000072")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000074")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000072")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000069")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000064")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000067")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000065")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000002e")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000067")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000067")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000009d0aec9905466c9adf79584fa75fed3")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000020a97ec3f8efbc2aca0cf7cabb420b4a")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000002cadd095dd4c79be57481ff3cae27e87")
            .unwrap(),
        Felt::from_hex("0x00000000000000000000000000000000880c7bb948df5c60afb4dbf6a917fba9")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000015")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000002c")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000022")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000063")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000072")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000006f")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000073")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000073")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000004f")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000072")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000069")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000067")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000069")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000006e")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000022")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000003a")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000066")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000061")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000006c")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000073")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000065")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000007d")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000000000000000000000000000000000001d")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000004e0b008cd0b8d9a9c64830df6efa2548")
            .unwrap(),
        Felt::from_hex("0x000000000000000000000000000000002aba20e79e4c51aecb1e120f1185d5f4")
            .unwrap(),
        Felt::from_hex("0x00000000000000000000000000000000d632cc718fba9860e3494b59bdb051c5")
            .unwrap(),
        Felt::from_hex("0x00000000000000000000000000000000143df3879a691beb27411995d77213b2")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
        Felt::from_hex("0x00ef1aeac8d4decd26f86dad28bb896827994b3fd92589b580df580f69c5a5e5")
            .unwrap(),
        Felt::from_hex("0x020abe5cc4da0e171c92e9820a854d33da2e58160c0aa0546640b417983a8f55")
            .unwrap(),
        Felt::from_hex("0x02b3d322627d1b6c191e3fa98bf7c00d412936471af33b72b208dd7c5dd49c64")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
        Felt::from_hex("0x01e6a6f52e47fe42e024287b729bc47e58019fcc7e1cc8b141bb8d669b779b49")
            .unwrap(),
        Felt::from_hex("0x05e78a9e39015195e90123199b682ea033ab86544389c2dd095927e60872f7e3")
            .unwrap(),
        Felt::from_hex("0x02fddd8a37692be0532bc15f2b97e5d0ba24bb76e1102a1857c9b9da24b4c887")
            .unwrap(),
        Felt::from_hex("0x0000000000000000000000000000000000000000000000000000000000000000")
            .unwrap(),
    ];

    // The contract address from the JSON
    let address =
        Felt::from_hex("0xbc3b7ff01e14f3096101a2abdbbf97482cfed9b0188aba198f3b894b1fc4b").unwrap();

    // 1. Create the TypedData from the JSON structure
    let typed_data = TypedData {
        types: [
            (
                "StarknetDomain".to_string(),
                vec![
                    Field::SimpleType(SimpleField {
                        name: "name".to_string(),
                        r#type: "shortstring".to_string(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "chainId".to_string(),
                        r#type: "shortstring".to_string(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "version".to_string(),
                        r#type: "shortstring".to_string(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "revision".to_string(),
                        r#type: "shortstring".to_string(),
                    }),
                ],
            ),
            (
                "UsernameRequest".to_string(),
                vec![
                    Field::SimpleType(SimpleField {
                        name: "username".to_string(),
                        r#type: "string".to_string(),
                    }),
                    Field::SimpleType(SimpleField {
                        name: "timestamp".to_string(),
                        r#type: "felt".to_string(),
                    }),
                ],
            ),
        ]
        .into_iter()
        .collect(),
        primary_type: "UsernameRequest".to_string(),
        domain: Domain {
            name: "PonziLand".to_string(),
            chain_id: "0x534e5f5345504f4c4941".to_string(),
            version: "1741806189068".to_string(),
            revision: Some("1".to_string()),
        },
        message: [
            (
                "username".to_string(),
                PrimitiveType::String("redder".to_string()),
            ),
            (
                "timestamp".to_string(),
                PrimitiveType::String("1741806192".to_string()),
            ),
        ]
        .into_iter()
        .collect(),
    };

    // 2. Compute the hash of the typed data
    let typed_data_hash = typed_data.encode(address).unwrap();
    println!("TypedData hash: {:?}", typed_data_hash.hash);
    println!(
        "Domain separator hash: {:?}",
        typed_data_hash.domain_separator_hash
    );
    println!("Type hash: {:?}", typed_data_hash.type_hash);
    println!("Message hash: {:?}", typed_data_hash.message_hash);

    // 3. Deserialize the signature (skipping the first element which is the magic value)
    let mut signature_span = signature.as_slice();

    // Skip the SESSION_TYPED_DATA_MAGIC value
    assert_eq!(signature_span[0], short_string!("session-typed-data"));
    signature_span = &signature_span[1..];

    // Deserialize the DetailedTypedData array
    let detailed_typed_data_items: Vec<DetailedTypedData> =
        match <Vec<DetailedTypedData> as CairoSerde>::cairo_deserialize(signature_span, 0) {
            Ok(items) => items,
            Err(e) => {
                println!("Error deserializing DetailedTypedData: {:?}", e);
                Vec::new()
            }
        };

    // Skip the deserialized DetailedTypedData
    let mut offset = 1; // Start after the array length
    for item in &detailed_typed_data_items {
        offset += 2; // domain_hash and type_hash
        offset += 1; // params length
        offset += item.params.len();
    }

    // Deserialize the SessionToken
    let session_token: SessionToken =
        match <SessionToken as CairoSerde>::cairo_deserialize(signature_span, offset) {
            Ok(token) => token,
            Err(e) => {
                println!("Error deserializing SessionToken: {:?}", e);
                panic!("Failed to deserialize SessionToken");
            }
        };

    println!(
        "Deserialized DetailedTypedData items: {}",
        detailed_typed_data_items.len()
    );
    for (i, item) in detailed_typed_data_items.iter().enumerate() {
        println!(
            "Item {}: domain_hash={:?}, type_hash={:?}, params.len={}",
            i,
            item.domain_hash,
            item.type_hash,
            item.params.len()
        );

        println!("  Params: {:?}", item.params);
    }

    println!("Deserialized SessionToken: {:?}", session_token);

    // 4. Convert the DetailedTypedData to AbiTypedData
    let typed_data_items: Vec<AbiTypedData> = detailed_typed_data_items
        .iter()
        .map(|detailed| {
            // Use core::poseidon from starknet
            let mut state = [detailed.domain_hash, detailed.type_hash, Felt::from(2)];
            starknet_types_core::hash::Poseidon::hades_permutation(&mut state);
            let scope_hash = state[0];

            // Compute the typed_data_hash from the params
            let mut hash_inputs = vec![detailed.type_hash];
            hash_inputs.extend_from_slice(&detailed.params);
            let typed_data_hash = poseidon_hash_many(&hash_inputs);

            AbiTypedData {
                scope_hash,
                typed_data_hash,
            }
        })
        .collect();

    println!("Converted AbiTypedData items: {}", typed_data_items.len());
    for (i, item) in typed_data_items.iter().enumerate() {
        println!(
            "Item {}: scope_hash={:?}, typed_data_hash={:?}",
            i, item.scope_hash, item.typed_data_hash
        );
    }

    // 5. Simulate the contract verification logic to reproduce the message-hash-mismatch error
    println!("\n=== Simulating Contract Verification Logic ===");

    // Reusable parts for computing individual SNIP-12 hashes
    let snip_12_prefix = short_string!("StarkNet Message");

    // Collect individual SNIP-12 hashes
    let mut message_hashes: Vec<Felt> = Vec::new();

    for detailed_typed_data in &detailed_typed_data_items {
        // SNIP-12 message encoding (similar to the contract code)
        let mut params_hash_inputs = vec![detailed_typed_data.type_hash];
        params_hash_inputs.extend_from_slice(&detailed_typed_data.params);
        let message_hash = poseidon_hash_many(&params_hash_inputs);

        // SNIP-12's full message hash
        let full_message_hash = poseidon_hash_many(&[
            snip_12_prefix,
            detailed_typed_data.domain_hash,
            address,
            message_hash,
        ]);

        message_hashes.push(full_message_hash);

        println!(
            "Detailed item: domain_hash={:?}, type_hash={:?}",
            detailed_typed_data.domain_hash, detailed_typed_data.type_hash
        );
        println!("  Params hash (typed_data_hash): {:?}", message_hash);
        println!("  Full message hash: {:?}", full_message_hash);
    }

    // Final message hash (either single hash or combined)
    let final_message_hash = if message_hashes.len() == 1 {
        // Compatible with SNIP-12
        message_hashes[0]
    } else {
        // Custom extension to SNIP-12 for multiple messages
        poseidon_hash_many(&message_hashes)
    };

    println!("\n=== Comparison of Hashes ===");
    println!("TypedData hash from encode(): {:?}", typed_data_hash.hash);
    println!(
        "Final message hash from signature: {:?}",
        final_message_hash
    );

    // Check if there's a mismatch
    if typed_data_hash.hash != final_message_hash {
        println!("❌ MISMATCH DETECTED: message-hash-mismatch");

        // Compare domain separator hash
        println!(
            "\nDomain separator hash from TypedData: {:?}",
            typed_data_hash.domain_separator_hash
        );
        println!(
            "Domain hash from signature: {:?}",
            detailed_typed_data_items[0].domain_hash
        );

        // Compare type hash
        println!(
            "\nType hash from TypedData: {:?}",
            typed_data_hash.type_hash
        );
        println!(
            "Type hash from signature: {:?}",
            detailed_typed_data_items[0].type_hash
        );

        // Compare message hash
        println!(
            "\nMessage hash from TypedData: {:?}",
            typed_data_hash.message_hash
        );

        // Detailed analysis of the encoding
        println!("\n=== Detailed Analysis ===");
        println!("TypedData primary_type: {}", typed_data.primary_type);
        println!("TypedData domain: {:?}", typed_data.domain);

        // Analyze the message structure
        println!("\nMessage structure:");
        for (key, value) in &typed_data.message {
            println!("  {}: {:?}", key, value);
        }
    } else {
        println!("✅ MATCH: Hashes match correctly");
    }
}
