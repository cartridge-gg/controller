mod errors;
mod signer;
mod storage;
mod types;
mod utils;

use std::str::FromStr;
use std::sync::Arc;

use account_sdk::abigen::controller::OutsideExecution;
use account_sdk::account::outside_execution::OutsideExecutionCaller;
use account_sdk::account::session::hash::AllowedMethod;
use account_sdk::account::MessageSignerAccount;
use account_sdk::controller::Controller;
use account_sdk::provider::CartridgeJsonRpcProvider;
use account_sdk::signers::webauthn::{CredentialID, WebauthnSigner};
use base64::engine::general_purpose;
use base64::Engine;
use coset::{CborSerializable, CoseKey};
use serde_wasm_bindgen::{from_value, to_value};
use signer::BrowserBackend;
use starknet::core::types::Call;
use starknet::core::types::Felt;
use starknet::macros::short_string;
use starknet::signers::SigningKey;
use url::Url;
use wasm_bindgen::prelude::*;

use crate::errors::OperationError;
use crate::types::invocation::JsInvocationsDetails;
use crate::types::session::JsCredentials;
use crate::types::TryFromJsValue;
use crate::utils::set_panic_hook;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeAccount {
    controller: Controller<
        Arc<CartridgeJsonRpcProvider>,
        WebauthnSigner<BrowserBackend>,
        SigningKey,
        BrowserBackend,
    >,
}

#[wasm_bindgen]
impl CartridgeAccount {
    /// Creates a new `CartridgeAccount` instance.
    ///
    /// # Parameters
    /// - `app_id`: Application identifier.
    /// - `rpc_url`: The URL of the JSON-RPC endpoint.
    /// - `chain_id`: Identifier of the blockchain network to interact with.
    /// - `address`: The blockchain address associated with the account.
    /// - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
    /// - `origin`: The origin of the WebAuthn request. Example https://cartridge.gg
    /// - `username`: Username associated with the account.
    /// - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
    /// - `public_key`: Base64 encoded bytes of the public key generated during the WebAuthn registration process (COSE format).
    ///
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        app_id: String,
        rpc_url: String,
        chain_id: String,
        address: String,
        rp_id: String,
        username: String,
        credential_id: String,
        public_key: String,
    ) -> Result<CartridgeAccount> {
        set_panic_hook();

        let rpc_url = Url::parse(&rpc_url)?;
        let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

        let credential_id_bytes = general_purpose::URL_SAFE_NO_PAD.decode(credential_id)?;
        let credential_id = CredentialID::from(credential_id_bytes);

        let cose_bytes = general_purpose::URL_SAFE_NO_PAD.decode(public_key)?;
        let cose = CoseKey::from_slice(&cose_bytes)?;

        let device_signer = WebauthnSigner::new(rp_id, credential_id, cose, BrowserBackend);

        let dummy_guardian = SigningKey::from_secret_scalar(short_string!("CARTRIDGE_GUARDIAN"));
        let address = Felt::from_str(&address)?;
        let chain_id = Felt::from_str(&chain_id)?;
        let username = username.to_lowercase();

        let controller = Controller::new(
            app_id,
            username.clone(),
            Arc::new(provider),
            device_signer.clone(),
            dummy_guardian,
            address,
            chain_id,
            BrowserBackend,
        );

        Ok(CartridgeAccount { controller })
    }

    #[wasm_bindgen(js_name = createSession)]
    pub async fn create_session(
        &mut self,
        policies: Vec<JsValue>,
        expires_at: u64,
    ) -> Result<JsValue> {
        set_panic_hook();

        let methods = policies
            .into_iter()
            .map(AllowedMethod::try_from_js_value)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let (authorization, private_key) =
            self.controller.create_session(methods, expires_at).await?;

        Ok(to_value(&JsCredentials {
            authorization,
            private_key,
        })?)
    }

    #[wasm_bindgen(js_name = estimateInvokeFee)]
    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<JsValue>,
        fee_multiplier: Option<f64>,
    ) -> Result<JsValue> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let fee_estimate = self
            .controller
            .estimate_invoke_fee(calls, fee_multiplier)
            .await
            .map_err(|e| OperationError::FeeEstimation(format!("{:#?}", e)))?;

        Ok(to_value(&fee_estimate)?)
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &self,
        calls: Vec<JsValue>,
        transaction_details: JsValue,
    ) -> Result<JsValue> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let details = JsInvocationsDetails::try_from(transaction_details)?;
        let result = self
            .controller
            .execute(calls, details.nonce, details.max_fee)
            .await
            .map_err(|e| OperationError::Execution(format!("{:#?}", e)))?;

        Ok(to_value(&result)?)
    }

    #[wasm_bindgen(js_name = executeFromOutside)]
    pub async fn execute_from_outside(
        &self,
        calls: Vec<JsValue>,
        caller: JsValue,
    ) -> Result<JsValue> {
        set_panic_hook();

        let calls: Vec<Call> = calls
            .clone()
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<_, _>>()?;

        let caller = match from_value::<String>(caller)? {
            s if s == "ANY_CALLER" => OutsideExecutionCaller::Any,
            address => OutsideExecutionCaller::Specific(Felt::from_hex(&address)?.into()),
        };

        let response = self
            .controller
            .execute_from_outside(OutsideExecution {
                caller: caller.into(),
                execute_after: 0_u64,
                execute_before: 3000000000_u64,
                calls: calls.into_iter().map(|call| call.into()).collect(),
                nonce: SigningKey::from_random().secret_scalar(),
            })
            .await?;

        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = hasSession)]
    pub fn has_session(&self, calls: Vec<JsValue>) -> Result<bool> {
        let calls: Vec<Call> = calls
            .clone()
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<_, _>>()?;

        Ok(self.controller.session_account(&calls).is_some())
    }

    #[wasm_bindgen(js_name = sessionJson)]
    pub fn session_json(&self) -> Result<JsValue> {
        self.controller
            .session_metadata()
            .map(|metadata| to_value(&metadata))
            .transpose()?
            .map_or_else(|| Ok(JsValue::NULL), Ok)
    }

    #[wasm_bindgen(js_name = revokeSession)]
    pub fn revoke_session(&self) -> Result<()> {
        unimplemented!("Revoke Session not implemented");
    }

    #[wasm_bindgen(js_name = signMessage)]
    pub async fn sign_message(&self, typed_data: String) -> Result<JsValue> {
        set_panic_hook();

        let signature = self
            .controller
            .sign_message(serde_json::from_str(&typed_data)?)
            .await
            .map_err(OperationError::SignMessage)?;

        Ok(to_value(&signature)?)
    }

    #[wasm_bindgen(js_name = deploySelf)]
    pub async fn deploy_self(&self, max_fee: JsValue) -> Result<JsValue> {
        set_panic_hook();

        let res = self
            .controller
            .deploy()
            .max_fee(from_value(max_fee)?)
            .send()
            .await
            .map_err(|e| OperationError::Deployment(format!("{:#?}", e)))?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = delegateAccount)]
    pub async fn delegate_account(&self) -> Result<JsValue> {
        set_panic_hook();

        let res: Felt = self
            .controller
            .delegate_account()
            .await
            .map_err(|e| OperationError::Delegation(e.to_string()))?;

        Ok(to_value(&res)?)
    }
}
