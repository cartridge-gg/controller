#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use account_sdk::webauthn_signer::{credential, signers::p256r1::P256r1Signer};
use account_wasm::WebauthnAccount;
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::*;
use wasm_webauthn::*;
use web_sys::{
    console,
    js_sys::{Array, Uint8Array},
};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_registration() {

    // let credential_id = "eKevwLuJRlxrprRHrARD8afsPvQ=";

    // let account = WebauthnAccount::new(
    //     "http://localhost:5050".to_string(),
    //     "0x123".to_string(),
    //     "0x123".to_string(),
    //     "localhost".to_string(),
    //     credential_id.to_string(),
    // ).unwrap();

    // let challenge: Array = vec![4, 2].iter().map(|x| JsValue::from(*x as u8)).collect();
    // let _ = account.sign(Uint8Array::new(&challenge)).await;
}

// #[wasm_bindgen_test]
// async fn test_webauth_wasm() {
//     let credential = register().await;
//     let assertion = get_assertion(credential);
// }

// async fn register() -> Credential {
//     let MakeCredentialResponse { credential } = MakeCredentialArgsBuilder::default()
//         .rp_id(Some("localhost".to_string()))
//         .challenge([42u8; 32].to_vec())
//         .uv(UserVerificationRequirement::Required)
//         .build().expect("invalid args")
//         .make_credential().await
//         .expect("make credential");
//     credential
// }

// async fn get_assertion(mut credential: Credential) {
//     credential.public_key = None;
//     let GetAssertionResponse {
//         signature,
//         client_data_json,
//         flags,
//         counter,
//     } = GetAssertionArgsBuilder::default()
//         .credentials(Some(vec![credential.into()]))
//         .challenge("Hello World".as_bytes().to_vec())
//         .build()
//         .expect("invalid args")
//         .get_assertion().await
//         .expect("get assertion");
// }
