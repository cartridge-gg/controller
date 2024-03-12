mod utils;
mod types;

use account_sdk::webauthn_signer::P256r1Signer;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

#[wasm_bindgen]
pub struct WebauthnSigner {
    pub_key: String,
    credential_id: String,
    signer: P256r1Signer,
    rp_id: String
}

#[wasm_bindgen]
impl WebauthnSigner {
    #[wasm_bindgen(js_name = getPubKey)]
    pub fn get_pub_key(&self) -> String {
        utils::set_panic_hook();
        log("Get Public Key");
        self.pub_key.clone()
    }

    #[wasm_bindgen(js_name = signMessage)]
    pub fn sign_message(&self) -> Vec<JsValue> {
        unimplemented!("Sign Message not implemented");
    }

    #[wasm_bindgen(js_name = signTransaction)]
    pub fn sign_transaction(&self) -> Vec<JsValue> {
        unimplemented!("Sign Transaction not implemented");
    }

    #[wasm_bindgen(js_name = signDeployAccountTransaction)]
    pub fn sign_deploy_account_transaction(&self) -> Vec<JsValue> {
        unimplemented!("Sign Deploy Account Transaction not implemented");
    }

    #[wasm_bindgen(js_name = signDeclareTransaction)]
    pub fn sign_declare_transaction(&self) -> Vec<JsValue> {
        unimplemented!("Sign Declare Transaction not implemented");
    }
}

