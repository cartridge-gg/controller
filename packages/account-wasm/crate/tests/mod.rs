use account_sdk::signers::webauthn::device::DeviceSigner;
use base64::{engine::general_purpose, Engine};
use starknet::macros::felt;
use wasm_bindgen_test::*;
use web_sys::console;

wasm_bindgen_test_configure!(run_in_browser);

// When running test use http://localhost:8000 rather than 127.0.0.1:8000 as the latter is not a valid origin for webauthn

// #[wasm_bindgen_test]
// async fn test_webauthn_new() {
//     let credential_id = "AANPCvc+A0MJPFk/KByHAA";
//     let public_key = "pQECAyYgASFYIB4tKH6vbd5AE0wAhCKY9hOSHKU+/eQUV5FMvQla7uFfIlgg8pH6a0OT1Ilohi5mcWCUuR9PCSIUh7Npo6ckoHmoYWk";

//     let account = WebauthnAccount::new(
//         "http://localhost:5050".to_string(),
//         "0x1".to_string(),
//         "0x2".to_string(),
//         "localhost".to_string(),
//         "http://localhost".to_string(),
//         credential_id.to_string(),
//         public_key.to_string(),
//     )
//     .unwrap();
// }

#[wasm_bindgen_test]
async fn test_register_and_sign() {
    let rp_id = "localhost";
    let origin = "http://localhost";
    let account = DeviceSigner::register(
        rp_id.to_string(),
        origin.to_string(),
        "localhost".to_string(),
        &vec![],
    )
    .await
    .unwrap();

    let challenge = felt!("0x0169af1f6f99d35e0b80e0140235ec4a2041048868071a8654576223934726f5");
    let challenge_bytes = challenge.to_bytes_be();
    let assertion = account.sign(&challenge_bytes).await.unwrap();
    console::log_1(&assertion.client_data_json.into());
}
