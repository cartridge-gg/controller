use account_sdk::webauthn_signer::signers::{device::DeviceSigner, p256r1::P256r1Signer, Signer};
use starknet::macros::felt;
use wasm_bindgen_test::*;
use web_sys::console;

wasm_bindgen_test_configure!(run_in_browser);

// When running test use http://localhost:8000 rather than 127.0.0.1:8000 as the latter is not a valid origin for webauthn
#[wasm_bindgen_test]
async fn test_webauth_wasm() {
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

    let signer = P256r1Signer::random(rp_id.to_string(), origin.to_string());
    let assertion = signer.sign(&challenge_bytes).await.unwrap();
    console::log_1(&assertion.client_data_json.into());
}
