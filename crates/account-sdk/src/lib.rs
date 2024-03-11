mod utils;

use account_sdk::webauthn_signer::P256r1Signer;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, account-sdk!");
    let signer = P256r1Signer::random(origin.clone());
    let private_key = SigningKey::from_random();

    alert(format!(
        "Random private key: {}",
        private_key.verifying_key().scalar()
    ));
}
