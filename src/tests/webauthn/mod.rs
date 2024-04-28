mod utils;

use starknet::{
    core::types::{BlockId, BlockTag},
    signers::SigningKey,
};

use crate::{
    abigen::cartridge_account::SignerType, tests::runners::katana_runner::KatanaRunner,
    webauthn_signer::signers::p256r1::P256r1Signer,
};

#[tokio::test]
async fn test_deploy_with_webauthn_owner() {
    let private_key = SigningKey::from_random();
    let rp_id = "rp_id".to_string();
    let origin = "localhost".to_string();
    let signer = P256r1Signer::random(origin.clone(), rp_id.clone());

    let data = utils::WebauthnTestData::<KatanaRunner>::new(private_key, signer).await;
    let reader = data.account_reader();

    let owner_type = reader
        .get_owner_type()
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .unwrap();

    assert_eq!(owner_type, SignerType::Webauthn);
}

// #[tokio::test]
// async fn test_verify_webauthn_explicit() {
//     let private_key = SigningKey::from_random();
//     let origin = "localhost".to_string();
//     let signer = P256r1Signer::random(origin.clone());

//     let data = utils::WebauthnTestData::<KatanaRunner>::new(private_key, signer).await;
//     data.set_webauthn_public_key().await;
//     let reader = data.account_reader();

//     let challenge = felt!("0x0169af1f6f99d35e0b80e0140235ec4a2041048868071a8654576223934726f5");
//     let challenge_bytes = challenge.to_bytes_be().to_vec();
//     let response = data
//         .signer
//         .sign(&challenge_bytes)
//         .await
//         .expect("signer error");

//     let args = VerifyWebauthnSignerArgs::from_response(origin, challenge_bytes, response.clone());

//     let signature = WebauthnSignature {
//         signature_type: crate::webauthn_signer::WEBAUTHN_SIGNATURE_TYPE,
//         r: args.r.into(),
//         s: args.s.into(),
//         type_offset: args.type_offset,
//         challenge_offset: args.challenge_offset,
//         origin_offset: args.origin_offset,
//         client_data_json: args.client_data_json,
//         origin: args.origin,
//         authenticator_data: args.authenticator_data,
//     };

//     let result = reader
//         .verify_webauthn_signer(&signature, &challenge)
//         .block_id(BlockId::Tag(BlockTag::Latest))
//         .call()
//         .await
//         .unwrap();

//     assert!(result);
// }

#[tokio::test]
async fn test_verify_webauthn_execute() {
    let private_key = SigningKey::from_random();
    let rp_id = "rp_id".to_string();
    let origin = "localhost".to_string();
    let signer = P256r1Signer::random(origin.clone(), rp_id.clone());

    let data = utils::WebauthnTestData::<KatanaRunner>::new(private_key, signer).await;

    let webauthn_executor = data.webauthn_executor().await;

    let result = webauthn_executor.test_authenticate().send().await;
    result.unwrap();
}

// #[tokio::test]
// async fn test_signer() {
//     let rp_id = "https://localhost:8080".to_string();
//     let signer = P256r1Signer::random(rp_id);
//     let calldata = signer.sign("842903840923".as_bytes()).await.unwrap();
//     dbg!(&calldata);
// }
