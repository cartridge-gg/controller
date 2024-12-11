use account_sdk::account::session::policy::Policy as SdkPolicy;
use account_sdk::controller::Controller;
use account_sdk::errors::ControllerError;
use account_sdk::signers::Owner;
use account_sdk::typed_data::{encode_type, TypedData};
use serde_wasm_bindgen::to_value;
use starknet::accounts::ConnectedAccount;
use starknet::core::types::Call;
use starknet::core::utils::starknet_keccak;
use starknet_crypto::poseidon_hash;
use starknet_types_core::felt::Felt;
use std::cell::RefCell;
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
    controller: RefCell<Controller>,
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
        class_hash: JsFelt,
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
            class_hash.0,
            rpc_url,
            Owner::Signer(signer.try_into()?),
            address.0,
            chain_id.0,
        );

        Ok(CartridgeAccount {
            controller: RefCell::new(controller),
        })
    }

    #[wasm_bindgen(js_name = fromStorage)]
    pub fn from_storage(app_id: String) -> Result<Option<CartridgeAccount>> {
        set_panic_hook();

        let controller =
            Controller::from_storage(app_id).map_err(|e| JsError::new(&e.to_string()))?;

        match controller {
            Some(c) => Ok(Some(CartridgeAccount {
                controller: RefCell::new(c),
            })),
            None => Ok(None),
        }
    }

    #[wasm_bindgen(js_name = username)]
    pub fn username(&self) -> String {
        self.controller.borrow().username.clone()
    }

    #[wasm_bindgen(js_name = address)]
    pub fn address(&self) -> String {
        self.controller.borrow().address.to_hex_string()
    }

    #[wasm_bindgen(js_name = classHash)]
    pub fn class_hash(&self) -> String {
        self.controller.borrow().class_hash.to_hex_string()
    }

    #[wasm_bindgen(js_name = rpcUrl)]
    pub fn rpc_url(&self) -> String {
        self.controller.borrow().rpc_url.to_string()
    }

    #[wasm_bindgen(js_name = chainId)]
    pub fn chain_id(&self) -> String {
        self.controller.borrow().chain_id.to_string()
    }

    #[wasm_bindgen(js_name = disconnect)]
    pub fn disconnect(&self) -> std::result::Result<(), JsControllerError> {
        self.controller
            .borrow_mut()
            .disconnect()
            .map_err(JsControllerError::from)
    }

    #[wasm_bindgen(js_name = ownerGuid)]
    pub fn owner_guid(&self) -> JsFelt {
        JsFelt(self.controller.borrow().owner_guid())
    }

    #[wasm_bindgen(js_name = registerSession)]
    pub async fn register_session(
        &self,
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
            .borrow_mut()
            .register_session(methods, expires_at, public_key.0, Felt::ZERO, max_fee.0)
            .await
            .map_err(JsControllerError::from)?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = registerSessionCalldata)]
    pub fn register_session_calldata(
        &self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: JsFelt,
    ) -> std::result::Result<JsValue, JsControllerError> {
        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;
        let call = self.controller.borrow_mut().register_session_call(
            methods,
            expires_at,
            public_key.0,
            Felt::ZERO,
        )?;

        Ok(to_value(&call.calldata)?)
    }

    #[wasm_bindgen(js_name = upgrade)]
    pub fn upgrade(
        &self,
        new_class_hash: JsFelt,
    ) -> std::result::Result<JsCall, JsControllerError> {
        let call = self.controller.borrow().upgrade(new_class_hash.0);
        Ok(JsCall {
            contract_address: call.to,
            entrypoint: "upgrade".to_string(),
            calldata: call.calldata,
        })
    }

    #[wasm_bindgen(js_name = createSession)]
    pub async fn create_session(&self, policies: Vec<Policy>, expires_at: u64) -> Result<()> {
        set_panic_hook();

        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        self.controller
            .borrow_mut()
            .create_session(methods, expires_at)
            .await?;

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

        let fee_estimate = self.controller.borrow().estimate_invoke_fee(calls).await?;
        Ok(to_value(&fee_estimate)?)
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &self,
        calls: Vec<JsCall>,
        details: JsInvocationsDetails,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let result =
            Controller::execute(&mut self.controller.borrow_mut(), calls, details.max_fee).await?;

        Ok(to_value(&result)?)
    }

    #[wasm_bindgen(js_name = executeFromOutsideV2)]
    pub async fn execute_from_outside_v2(
        &self,
        calls: Vec<JsCall>,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<std::result::Result<_, _>>()?;

        let response = self
            .controller
            .borrow_mut()
            .execute_from_outside_v2(calls)
            .await?;
        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = executeFromOutsideV3)]
    pub async fn execute_from_outside_v3(
        &self,
        calls: Vec<JsCall>,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<std::result::Result<_, _>>()?;

        let response = self
            .controller
            .borrow_mut()
            .execute_from_outside_v3(calls)
            .await?;
        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = hasSession)]
    pub fn has_session(&self, calls: Vec<JsCall>) -> Result<bool> {
        let calls: Vec<Call> = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<_, _>>()?;

        Ok(self
            .controller
            .borrow()
            .session_account(&SdkPolicy::from_calls(&calls))
            .is_some())
    }

    #[wasm_bindgen(js_name = hasSessionForMessage)]
    pub fn has_session_for_message(&self, typed_data: String) -> Result<bool> {
        let typed_data: TypedData = serde_json::from_str(&typed_data)?;
        let domain_hash = typed_data.domain.encode(&typed_data.types)?;
        let type_hash =
            &starknet_keccak(encode_type(&typed_data.primary_type, &typed_data.types)?.as_bytes());
        let scope_hash = poseidon_hash(domain_hash, *type_hash);

        Ok(self
            .controller
            .borrow()
            .session_account(&[SdkPolicy::new_typed_data(scope_hash)])
            .is_some())
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
            .borrow()
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
            .borrow()
            .sign_message(serde_json::from_str(&typed_data)?)
            .await
            .map_err(|e| JsControllerError::from(ControllerError::SignError(e)))?;

        Ok(Felts(signature.into_iter().map(JsFelt).collect()))
    }

    #[wasm_bindgen(js_name = getNonce)]
    pub async fn get_nonce(&self) -> std::result::Result<JsValue, JsControllerError> {
        let nonce = self
            .controller
            .borrow()
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
            .borrow()
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
            .borrow()
            .delegate_account()
            .await
            .map_err(JsControllerError::from)?;

        Ok(JsFelt(res))
    }
}
