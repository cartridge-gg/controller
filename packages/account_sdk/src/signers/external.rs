#![cfg(target_arch = "wasm32")]

use crate::signers::SignError;
use crate::utils::js::extract_error_message;
use js_sys::Promise;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ExternalWalletType {
    Argent,
    Metamask,
    Phantom,
}

#[derive(Deserialize, Debug, Clone)]
struct ExternalWalletResponse {
    success: bool,
    wallet: ExternalWalletType,
    result: Option<serde_json::Value>,
    error: Option<String>,
    account: Option<String>,
}

#[wasm_bindgen]
extern "C" {
    // Assumes window.wallet_bridge.signMessage(wallet_type: string, message: string): Promise<ExternalWalletResponse>
    #[wasm_bindgen(js_namespace = ["window", "wallet_bridge"], catch, js_name = signMessage)]
    async fn sign_message(wallet_type: String, message: String) -> Result<JsValue, JsValue>;
}

/// Signs a message using the specified external wallet type connected via the WalletBridge.
///
/// # Arguments
///
/// * `wallet_type` - The type of the external wallet to use (e.g., Metamask, Argent).
/// * `message` - The message to sign.
///
/// # Returns
///
/// A `Result` containing the signature as a hex string on success,
/// or a `SignError` on failure.
pub async fn external_sign_message(
    wallet_type: ExternalWalletType,
    message: &str,
) -> Result<String, SignError> {
    let wallet_type_str = serde_json::to_string(&wallet_type)
        .map(|s| s.trim_matches('"').to_string()) // Convert enum to lowercase string (e.g., "metamask")
        .map_err(|e| {
            SignError::ExternalSignerError(format!("Failed to serialize wallet type: {}", e))
        })?;

    // Call the external JS function
    let promise_result = sign_message(wallet_type_str.clone(), message.to_string()).await;

    // Handle potential errors during the JS call itself (e.g., function not found)
    let promise = promise_result
        .map_err(|js_err| SignError::ExternalSignerError(extract_error_message(js_err)))?;

    // Await the JS Promise
    let result_value = JsFuture::from(Promise::from(promise))
        .await
        .map_err(|js_err| SignError::ExternalSignerError(extract_error_message(js_err)))?;

    // Deserialize the JsValue into our Rust struct
    let response: ExternalWalletResponse =
        serde_wasm_bindgen::from_value(result_value).map_err(|e| {
            SignError::ExternalSignerError(format!("Failed to deserialize response: {}", e))
        })?;

    // Check the response structure and extract result/error
    if response.success {
        response.result.ok_or_else(|| {
            SignError::ExternalSignerError(format!(
                "Wallet '{}' reported success but provided no signature result.",
                wallet_type_str
            ))
        })
    } else {
        let error_message = response
            .error
            .unwrap_or_else(|| "Unknown error".to_string());
        Err(SignError::ExternalSignerError(format!(
            "Wallet '{}' failed to sign: {}",
            wallet_type_str, error_message
        )))
    }
}
