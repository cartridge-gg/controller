mod errors;
mod signer;
mod storage;
mod types;
mod utils;

use std::sync::Arc;

use account_sdk::abigen::controller::OutsideExecution;
use account_sdk::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use account_sdk::account::session::SessionAccount;
use account_sdk::account::{AccountHashAndCallsSigner, MessageSignerAccount};
use account_sdk::constants::{Version, CONTROLLERS};
use account_sdk::controller::{Controller, ControllerError};
use account_sdk::provider::{CartridgeJsonRpcProvider, CartridgeProvider};
use account_sdk::signers::webauthn::{CredentialID, WebauthnSigner};
use account_sdk::signers::{HashSigner, Signer};
use base64::engine::general_purpose;
use base64::Engine;
use coset::{CborSerializable, CoseKey};
use errors::JsControllerError;
use serde_wasm_bindgen::to_value;
use signer::BrowserBackend;
use starknet::accounts::{Account, ConnectedAccount};
use starknet::core::types::Call;
use starknet::signers::SigningKey;
use types::call::JsCall;
use types::policy::Policy;
use types::session::{Session, SessionMetadata};
use types::{Felts, JsFelt};
use url::Url;
use wasm_bindgen::prelude::*;

use crate::types::invocation::JsInvocationsDetails;
use crate::utils::set_panic_hook;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeAccount {
    controller: Controller<Arc<CartridgeJsonRpcProvider>, BrowserBackend>,
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
        chain_id: JsFelt,
        address: JsFelt,
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

        let device_signer = Signer::Webauthn(WebauthnSigner::new(
            rp_id,
            credential_id,
            cose,
            BrowserBackend,
        ));

        let username = username.to_lowercase();

        let controller = Controller::new(
            app_id,
            username.clone(),
            CONTROLLERS[&Version::V1_0_4].hash,
            Arc::new(provider),
            device_signer.clone(),
            address.0,
            chain_id.0,
            BrowserBackend,
        );

        Ok(CartridgeAccount { controller })
    }

    #[wasm_bindgen(js_name = ownerGuid)]
    pub fn owner_guid(&self) -> JsFelt {
        JsFelt(self.controller.owner_guid())
    }

    #[wasm_bindgen(js_name = registerSession)]
    pub async fn register_session(
        &mut self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: JsFelt,
        max_fee: JsFelt,
    ) -> std::result::Result<JsValue, JsControllerError> {
        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let res = self
            .controller
            .register_session(methods, expires_at, public_key.0, max_fee.0)
            .await
            .map_err(JsControllerError::from)?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = registerSessionCalldata)]
    pub fn register_session_calldata(
        &mut self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: JsFelt,
    ) -> std::result::Result<JsValue, JsControllerError> {
        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;
        let call = self
            .controller
            .register_session_call(methods, expires_at, public_key.0)?;

        Ok(to_value(&call.calldata)?)
    }

    #[wasm_bindgen(js_name = upgrade)]
    pub fn upgrade(
        &self,
        new_class_hash: JsFelt,
    ) -> std::result::Result<JsCall, JsControllerError> {
        let call = self.controller.upgrade(new_class_hash.0);
        Ok(JsCall {
            contract_address: call.to,
            entrypoint: "upgrade".to_string(),
            calldata: call.calldata,
        })
    }

    #[wasm_bindgen(js_name = createSession)]
    pub async fn create_session(&mut self, policies: Vec<Policy>, expires_at: u64) -> Result<()> {
        set_panic_hook();

        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        self.controller.create_session(methods, expires_at).await?;

        Ok(())
    }

    #[wasm_bindgen(js_name = estimateInvokeFee)]
    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<JsCall>,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let fee_estimate = self.controller.estimate_invoke_fee(calls).await?;
        Ok(to_value(&fee_estimate)?)
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &mut self,
        calls: Vec<JsCall>,
        details: JsInvocationsDetails,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let result = Controller::execute(&mut self.controller, calls, details.max_fee).await?;

        Ok(to_value(&result)?)
    }

    #[wasm_bindgen(js_name = executeFromOutside)]
    pub async fn execute_from_outside(
        &self,
        calls: Vec<JsCall>,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<std::result::Result<_, _>>()?;

        let response = self.controller.execute_from_outside(calls).await?;
        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = hasSession)]
    pub fn has_session(&self, calls: Vec<JsCall>) -> Result<bool> {
        let calls: Vec<Call> = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<_, _>>()?;

        Ok(self.controller.session_account(&calls).is_some())
    }

    #[wasm_bindgen(js_name = session)]
    pub fn session_metadata(
        &self,
        policies: Vec<Policy>,
        public_key: Option<JsFelt>,
    ) -> std::result::Result<Option<SessionMetadata>, JsControllerError> {
        let policies = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(self
            .controller
            .session_metadata(&policies, public_key.map(|f| f.0))
            .map(|(_, metadata)| SessionMetadata::from(metadata)))
    }

    #[wasm_bindgen(js_name = revokeSession)]
    pub fn revoke_session(&self) -> Result<()> {
        unimplemented!("Revoke Session not implemented");
    }

    #[wasm_bindgen(js_name = signMessage)]
    pub async fn sign_message(&self, typed_data: String) -> Result<Felts> {
        set_panic_hook();

        let signature = self
            .controller
            .sign_message(serde_json::from_str(&typed_data)?)
            .await
            .map_err(|e| JsControllerError::from(ControllerError::SignError(e)))?;

        Ok(Felts(signature.into_iter().map(JsFelt).collect()))
    }

    #[wasm_bindgen(js_name = getNonce)]
    pub async fn get_nonce(&self) -> std::result::Result<JsValue, JsControllerError> {
        let nonce = self
            .controller
            .get_nonce()
            .await
            .map_err(|e| JsControllerError::from(ControllerError::ProviderError(e)))?;

        Ok(to_value(&nonce)?)
    }

    #[wasm_bindgen(js_name = deploySelf)]
    pub async fn deploy_self(&self, max_fee: JsFelt) -> Result<JsValue> {
        set_panic_hook();

        let res = self
            .controller
            .deploy()
            .max_fee(max_fee.0)
            .send()
            .await
            .map_err(|e| JsControllerError::from(ControllerError::AccountFactoryError(e)))?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = delegateAccount)]
    pub async fn delegate_account(&self) -> Result<JsFelt> {
        set_panic_hook();

        let res = self
            .controller
            .delegate_account()
            .await
            .map_err(JsControllerError::from)?;

        Ok(JsFelt(res))
    }
}

#[wasm_bindgen]
pub struct CartridgeSessionAccount(SessionAccount<Arc<CartridgeJsonRpcProvider>>);

#[wasm_bindgen]
impl CartridgeSessionAccount {
    pub fn new(
        rpc_url: String,
        signer: JsFelt,
        address: JsFelt,
        chain_id: JsFelt,
        session_authorization: Vec<JsFelt>,
        session: Session,
    ) -> Result<CartridgeSessionAccount> {
        let rpc_url = Url::parse(&rpc_url)?;
        let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

        let signer = Signer::Starknet(SigningKey::from_secret_scalar(signer.0));
        let address = address.0;
        let chain_id = chain_id.0;

        let session_authorization = session_authorization
            .into_iter()
            .map(|felt| felt.0)
            .collect::<Vec<_>>();
        let policies = session
            .policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let session = account_sdk::account::session::hash::Session::new(
            policies,
            session.expires_at,
            &signer.signer(),
        )?;

        Ok(CartridgeSessionAccount(SessionAccount::new(
            Arc::new(provider),
            signer,
            address,
            chain_id,
            session_authorization,
            session,
        )))
    }

    pub fn new_as_registered(
        rpc_url: String,
        signer: JsFelt,
        address: JsFelt,
        owner_guid: JsFelt,
        chain_id: JsFelt,
        session: Session,
    ) -> Result<CartridgeSessionAccount> {
        let rpc_url = Url::parse(&rpc_url)?;
        let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

        let signer = Signer::Starknet(SigningKey::from_secret_scalar(signer.0));
        let address = address.0;
        let chain_id = chain_id.0;

        let policies = session
            .policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let session = account_sdk::account::session::hash::Session::new(
            policies,
            session.expires_at,
            &signer.signer(),
        )?;

        Ok(CartridgeSessionAccount(SessionAccount::new_as_registered(
            Arc::new(provider),
            signer,
            address,
            chain_id,
            owner_guid.0,
            session,
        )))
    }

    pub async fn sign(&self, hash: JsFelt, calls: Vec<JsCall>) -> Result<Felts> {
        let hash = hash.0;
        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let res = self.0.sign_hash_and_calls(hash, &calls).await?;

        Ok(Felts(res.into_iter().map(JsFelt).collect()))
    }

    pub async fn execute(&self, calls: Vec<JsCall>) -> Result<JsValue> {
        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let res = self.0.execute_v1(calls).send().await?;

        Ok(to_value(&res)?)
    }

    pub async fn execute_from_outside(&self, calls: Vec<JsCall>) -> Result<JsValue> {
        let caller = OutsideExecutionCaller::Any;
        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let outside_execution = OutsideExecution {
            caller: caller.into(),
            execute_after: 0_u64,
            execute_before: 3000000000_u64,
            calls,
            nonce: SigningKey::from_random().secret_scalar(),
        };

        let signed = self
            .0
            .sign_outside_execution(outside_execution.clone())
            .await?;

        let res = self
            .0
            .provider()
            .add_execute_outside_transaction(outside_execution, self.0.address(), signed.signature)
            .await?;

        Ok(to_value(&res)?)
    }
}
