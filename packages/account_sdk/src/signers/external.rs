#![cfg(target_arch = "wasm32")]

use crate::signers::SignError;
use js_sys::{Object, Promise, Reflect};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = ["window", "keychain_wallets"], catch, js_name = signMessage)]
    async fn sign_message(identifier: String, message: String) -> Result<JsValue, JsValue>;
}

/// Extracts an error message string from a JsValue.
/// Tries to access the `message` property, otherwise converts the value to a string.
fn js_value_to_error_string(value: JsValue) -> String {
    if let Some(obj) = value.dyn_ref::<Object>() {
        if let Ok(message) = Reflect::get(obj, &JsValue::from_str("message")) {
            if let Some(message_str) = message.as_string() {
                return message_str;
            }
        }
    }
    value
        .as_string()
        .unwrap_or_else(|| "Unknown JS error".to_string())
}

/// Signs a message using the KeychainWalletService, which routes to the appropriate
/// embedded or external wallet.
/// The wallet is identified by a string (e.g., address or public key).
///
/// # Arguments
///
/// * `identifier` - The identifier string of the wallet (e.g., address).
/// * `message` - The message hex string to sign.
///
/// # Returns
///
/// A `Result` containing the signature as a hex string on success,
/// or a `SignError::BridgeError` on failure.
pub async fn external_sign_message(identifier: &str, message: &str) -> Result<String, SignError> {
    let promise_result = sign_message(identifier.to_string(), message.to_string()).await;

    let promise = match promise_result {
        Ok(p) => Promise::from(p),
        Err(js_err) => {
            return Err(SignError::BridgeError(js_value_to_error_string(js_err)));
        }
    };

    match JsFuture::from(promise).await {
        Ok(js_signature) => js_signature.as_string().ok_or_else(|| {
            SignError::BridgeError(
                "Keychain service returned non-string value for signature".to_string(),
            )
        }),
        Err(js_err) => Err(SignError::BridgeError(js_value_to_error_string(js_err))),
    }
}
