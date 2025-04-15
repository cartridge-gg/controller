use crate::signers::SignError;
use js_sys::{Object, Reflect};
use wasm_bindgen::prelude::*;

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

#[derive(Debug, serde::Deserialize)]
struct SignatureResult {
    success: bool,
    #[allow(unused)]
    wallet: String,
    result: String,
    error: Option<String>,
    #[allow(unused)]
    account: String,
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
    let promise_result = sign_message(identifier.to_string(), message.to_string())
        .await
        .map_err(|e| SignError::BridgeError(js_value_to_error_string(e)))?;

    let signature_result: SignatureResult = serde_wasm_bindgen::from_value(promise_result)
        .map_err(|e| SignError::BridgeError(format!("Failed to parse result: {}", e)))?;

    if !signature_result.success {
        return Err(SignError::BridgeError(
            signature_result
                .error
                .unwrap_or_else(|| "Unknown error".to_string()),
        ));
    }

    Ok(signature_result.result)
}
