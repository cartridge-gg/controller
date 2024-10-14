use account_sdk::artifacts::{Version, CONTROLLERS};
use account_sdk::controller::Controller;
use account_sdk::errors::ControllerError;
use serde_wasm_bindgen::to_value;
use starknet::accounts::ConnectedAccount;
use starknet::core::types::Call;
use url::Url;
use wasm_bindgen::prelude::*;

use crate::errors::JsControllerError;
use crate::types::call::JsCall;
use crate::types::invocation::JsInvocationsDetails;
use crate::types::policy::Policy;
use crate::types::session::SessionMetadata;
use crate::types::signer::Signer;
use crate::types::{Felts, JsFelt};
use crate::utils::set_panic_hook;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeAccount {
    controller: Controller,
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
    /// - `username`: Username associated with the account.
    /// - `signer`: A Signer struct containing the signer type and associated data.
    ///
    pub fn new(
        app_id: String,
        rpc_url: String,
        chain_id: JsFelt,
        address: JsFelt,
        username: String,
        signer: Signer,
    ) -> Result<CartridgeAccount> {
        set_panic_hook();

        let rpc_url = Url::parse(&rpc_url)?;

        let username = username.to_lowercase();

        let controller = Controller::new(
            app_id,
            username.clone(),
            CONTROLLERS[&Version::V1_0_5].hash,
            rpc_url,
            signer.try_into()?,
            address.0,
            chain_id.0,
        );

        Ok(CartridgeAccount { controller })
    }

    #[wasm_bindgen(js_name = fromStorage)]
    pub fn from_storage(app_id: String) -> Result<Option<CartridgeAccount>> {
        set_panic_hook();

        let controller =
            Controller::from_storage(app_id).map_err(|e| JsError::new(&e.to_string()))?;

        match controller {
            Some(c) => Ok(Some(CartridgeAccount { controller: c })),
            None => Ok(None),
        }
    }

    #[wasm_bindgen(js_name = username)]
    pub fn username(&self) -> String {
        self.controller.username.clone()
    }

    #[wasm_bindgen(js_name = address)]
    pub fn address(&self) -> String {
        self.controller.address.to_hex_string()
    }

    #[wasm_bindgen(js_name = rpcUrl)]
    pub fn rpc_url(&self) -> String {
        self.controller.rpc_url.to_string()
    }

    #[wasm_bindgen(js_name = chainId)]
    pub fn chain_id(&self) -> String {
        self.controller.chain_id.to_string()
    }

    #[wasm_bindgen(js_name = disconnect)]
    pub fn disconnect(&mut self) -> std::result::Result<(), JsControllerError> {
        self.controller
            .disconnect()
            .map_err(JsControllerError::from)
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
