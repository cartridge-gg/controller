mod types;
mod utils;

use std::str::FromStr;

use account_sdk::webauthn_signer::signers::{device::DeviceSigner, Signer};
use base64::{engine::general_purpose, Engine};
use serde_wasm_bindgen::to_value;
use starknet::{
    accounts::{Call, Execution},
    core::types::FieldElement,
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
};
use types::{JsCall, JsInvocationsDetails};
use url::Url;
use wasm_bindgen::prelude::*;
use web_sys::js_sys::{Array, Uint8Array};

#[wasm_bindgen]
pub struct WebauthnAccount {
    inner: account_sdk::webauthn_signer::account::WebauthnAccount<
        JsonRpcClient<HttpTransport>,
        DeviceSigner,
    >,
    signer: DeviceSigner,
    rp_id: String,
}

#[wasm_bindgen]
impl WebauthnAccount {
    /// Creates a new `WebauthnAccount` instance.
    ///
    /// # Parameters
    /// - `rpc_url`: The URL of the JSON-RPC endpoint.
    /// - `chain_id`: Identifier of the blockchain network to interact with.
    /// - `address`: The blockchain address associated with the account.
    /// - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
    /// - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
    ///
    pub fn new(
        rpc_url: String,
        chain_id: String,
        address: String,
        rp_id: String,
        credential_id: String,
    ) -> Result<WebauthnAccount, JsValue> {
        utils::set_panic_hook();

        let url = Url::parse(&rpc_url).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let provider = JsonRpcClient::new(HttpTransport::new(url));
        let credential_id = general_purpose::URL_SAFE_NO_PAD
            .decode(credential_id)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let signer = DeviceSigner::new(rp_id.clone(), credential_id);
        let address =
            FieldElement::from_str(&address).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let chain_id =
            FieldElement::from_str(&chain_id).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let inner = account_sdk::webauthn_signer::account::WebauthnAccount::new(
            provider,
            signer.clone(),
            address,
            chain_id,
        );

        Ok(WebauthnAccount {
            inner,
            signer,
            rp_id,
        })
    }

    /// Registers a new keypair on device signer and creates a new `WebauthnAccount` instance.
    ///
    /// # Parameters
    /// - `rpc_url`: The URL of the JSON-RPC endpoint.
    /// - `chain_id`: Identifier of the blockchain network to interact with.
    /// - `address`: The blockchain address associated with the account.
    /// - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
    /// - `user_name`: The user name associated with the account.
    pub async fn register(
        rpc_url: String,
        chain_id: String,
        address: String,
        rp_id: String,
        user_name: String,
    ) -> Result<WebauthnAccount, JsValue> {
        utils::set_panic_hook();

        let url = Url::parse(&rpc_url).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let provider = JsonRpcClient::new(HttpTransport::new(url));
        let signer = DeviceSigner::register(rp_id.clone(), user_name, &vec![])
            .await
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let address =
            FieldElement::from_str(&address).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let chain_id =
            FieldElement::from_str(&chain_id).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let inner = account_sdk::webauthn_signer::account::WebauthnAccount::new(
            provider,
            signer.clone(),
            address,
            chain_id,
        );

        Ok(WebauthnAccount {
            inner,
            signer,
            rp_id,
        })
    }

    #[wasm_bindgen(js_name = getCredentialId)]
    pub fn get_credential_id(&self) -> String {
        utils::set_panic_hook();

        general_purpose::STANDARD.encode(&self.signer.credential_id)
    }

    #[wasm_bindgen(js_name = getRpId)]
    pub fn get_rp_id(&self) -> String {
        self.rp_id.clone()
    }

    #[wasm_bindgen(js_name = sign)]
    pub async fn sign(&self, challenge: Uint8Array) -> Result<JsValue, JsValue> {
        utils::set_panic_hook();

        let assertion = self
            .signer
            .sign(&challenge.to_vec())
            .await
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        Ok(to_value(&assertion).unwrap_or_else(|_| JsValue::UNDEFINED))
    }

    #[wasm_bindgen(js_name = signTransaction)]
    pub async fn sign_transaction(
        &self,
        transactions: Vec<JsValue>,
        transaction_details: JsValue,
    ) -> Result<JsValue, JsValue> {
        utils::set_panic_hook();

        let calls = transactions
            .into_iter()
            .map(|js_value| {
                JsCall::try_from(js_value).and_then(|js_call| {
                    Call::try_from(js_call).map_err(|e| JsValue::from_str(&format!("{}", e)))
                })
            })
            .collect::<Result<Vec<Call>, _>>()?;

        let details = JsInvocationsDetails::try_from(transaction_details)?;

        let execution = Execution::new(calls, &self.inner)
            .max_fee(details.max_fee)
            .nonce(details.nonce)
            .prepared()
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        let broadcast = execution
            .get_invoke_request(false)
            .await
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        let signature_js: Array = broadcast
            .signature
            .iter()
            .map(|f| JsValue::from_str(&format!("0x{:x}", f)))
            .collect();

        Ok(JsValue::from(signature_js))
    }

    #[wasm_bindgen(js_name = signMessage)]
    pub fn sign_message(&self) -> Vec<JsValue> {
        unimplemented!("Sign Message not implemented");
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
