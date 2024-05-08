mod types;
mod utils;

use std::str::FromStr;

use starknet::macros::felt;
use starknet::signers::SigningKey;
use account_sdk::wasm_webauthn::CredentialID;
use account_sdk::signers::webauthn::device::DeviceSigner;
use base64::{engine::general_purpose, Engine};
use coset::{CborSerializable, CoseKey};
use serde_wasm_bindgen::to_value;
use starknet::accounts::Account;
use starknet::{
    accounts::{Call, Execution},
    core::types::{BroadcastedInvokeTransaction, FieldElement},
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
};
use types::{JsCall, JsInvocationsDetails};
use url::Url;
use wasm_bindgen::prelude::*;
use web_sys::js_sys::{Array, Uint8Array};

#[wasm_bindgen]
pub struct CartridgeAccount {
    inner: account_sdk::account::CartridgeGuardianAccount<
        JsonRpcClient<HttpTransport>,
        DeviceSigner,
        SigningKey,
    >,
    rp_id: String,
}

#[wasm_bindgen]
impl CartridgeAccount {
    /// Creates a new `CartridgeAccount` instance.
    ///
    /// # Parameters
    /// - `rpc_url`: The URL of the JSON-RPC endpoint.
    /// - `chain_id`: Identifier of the blockchain network to interact with.
    /// - `address`: The blockchain address associated with the account.
    /// - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
    /// - `origin`: The origin of the WebAuthn request. Example https://cartridge.gg
    /// - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
    /// - `public_key`: Base64 encoded bytes of the public key generated during the WebAuthn registration process (COSE format).
    ///
    pub fn new(
        rpc_url: String,
        chain_id: String,
        address: String,
        rp_id: String,
        origin: String,
        credential_id: String,
        public_key: String,
    ) -> Result<CartridgeAccount, JsValue> {
        utils::set_panic_hook();
        let url = Url::parse(&rpc_url).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let provider: JsonRpcClient<HttpTransport> = JsonRpcClient::new(HttpTransport::new(url));
        let credential_id = general_purpose::URL_SAFE_NO_PAD
            .decode(credential_id)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        let bytes = general_purpose::URL_SAFE_NO_PAD
            .decode(public_key)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        let cose = CoseKey::from_slice(&bytes).map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        let signer = DeviceSigner::new(
            rp_id.clone(),
            origin.clone(),
            CredentialID(credential_id),
            cose,
        );

        let dummy_guardian = SigningKey::from_secret_scalar(felt!("0x42"));

        let address =
            FieldElement::from_str(&address).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let chain_id =
            FieldElement::from_str(&chain_id).map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        let inner = account_sdk::account::CartridgeGuardianAccount::new(
            provider,
            signer,
            dummy_guardian,
            address,
            chain_id,
        );

        Ok(CartridgeAccount {
            inner,
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
    /// - `origin`: The origin of the WebAuthn request. Example https://cartridge.gg
    /// - `user_name`: The user name associated with the account.
    pub async fn register(
        rpc_url: String,
        chain_id: String,
        address: String,
        rp_id: String,
        origin: String,
        user_name: String,
    ) -> Result<CartridgeAccount, JsValue> {
        utils::set_panic_hook();

        let url = Url::parse(&rpc_url).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let provider = JsonRpcClient::new(HttpTransport::new(url));
        let signer = DeviceSigner::register(rp_id.clone(), origin.clone(), user_name, &vec![])
            .await
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let dummy_guardian = SigningKey::from_secret_scalar(felt!("0x42"));
        let address =
            FieldElement::from_str(&address).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let chain_id =
            FieldElement::from_str(&chain_id).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let inner = account_sdk::account::CartridgeGuardianAccount::new(
            provider,
            signer,
            dummy_guardian,
            address,
            chain_id,
        );

        Ok(CartridgeAccount {
            inner,
            rp_id,
        })
    }

    #[wasm_bindgen(js_name = getRpId)]
    pub fn get_rp_id(&self) -> String {
        self.rp_id.clone()
    }

    #[wasm_bindgen(js_name = sign)]
    pub async fn sign(&self, _challenge: Uint8Array) -> Result<JsValue, JsValue> {
        // utils::set_panic_hook();

        // let assertion = self
        //     .signer
        //     .sign(&challenge.to_vec())
        //     .await
        //     .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        // Ok(to_value(&assertion).unwrap_or_else(|_| JsValue::UNDEFINED))
        unimplemented!("Sign Message not implemented");
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &self,
        calls: Vec<JsValue>,
        transaction_details: JsValue,
    ) -> Result<JsValue, JsValue> {
        utils::set_panic_hook();

        let calls = calls
            .into_iter()
            .map(|js_value| {
                JsCall::try_from(js_value).and_then(|js_call| {
                    Call::try_from(js_call).map_err(|e| JsValue::from_str(&format!("{}", e)))
                })
            })
            .collect::<Result<Vec<Call>, _>>()?;

        let details: JsInvocationsDetails = JsInvocationsDetails::try_from(transaction_details)?;
        let execution = self
            .inner
            .execute(calls)
            .max_fee(details.max_fee)
            .nonce(details.nonce)
            .send()
            .await
            .map_err(|e| JsValue::from_str(&format!("{}", e.to_string())))?;

        Ok(to_value(&execution).map_err(|e| JsValue::from_str(&format!("{}", e)))?)
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

        let signature = match broadcast {
            BroadcastedInvokeTransaction::V1(invoke) => invoke.signature,
            BroadcastedInvokeTransaction::V3(invoke) => invoke.signature,
        };

        let signature_js: Array = signature
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
