mod utils;

// use account_sdk::webauthn_signer::P256r1Signer;
use starknet::signers::SigningKey;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen(js_name = generateKey)]
pub fn generate_key() -> String {
    // let origin = "localhost".to_string();
    // let signer = P256r1Signer::random(origin.clone());
    let private_key = SigningKey::from_random();

    log(&format!(
        "Random private key: {}",
        private_key.secret_scalar().to_string(),
    ));

    private_key.secret_scalar().to_string()
}
