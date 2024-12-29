use std::borrow::BorrowMut;

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
use url::Url;
use wasm_bindgen::prelude::*;

use crate::errors::JsControllerError;
use crate::sync::WasmMutex;
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
    controller: WasmMutex<Controller>,
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
    #[allow(clippy::new_ret_no_self)]
    pub fn new(
        app_id: String,
        class_hash: JsFelt,
        rpc_url: String,
        chain_id: JsFelt,
        address: JsFelt,
        username: String,
        signer: Signer,
    ) -> Result<CartridgeAccountWithMeta> {
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

        Ok(CartridgeAccountWithMeta::new(controller))
    }

    #[wasm_bindgen(js_name = fromStorage)]
    pub fn from_storage(app_id: String) -> Result<Option<CartridgeAccountWithMeta>> {
        set_panic_hook();

        let controller =
            Controller::from_storage(app_id).map_err(|e| JsError::new(&e.to_string()))?;

        match controller {
            Some(c) => Ok(Some(CartridgeAccountWithMeta::new(c))),
            None => Ok(None),
        }
    }

    #[wasm_bindgen(js_name = disconnect)]
    pub async fn disconnect(&self) -> std::result::Result<(), JsControllerError> {
        self.controller
            .lock()
            .await
            .disconnect()
            .map_err(JsControllerError::from)
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
            .lock()
            .await
            .register_session(methods, expires_at, public_key.0, Felt::ZERO, max_fee.0)
            .await
            .map_err(JsControllerError::from)?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = registerSessionCalldata)]
    pub async fn register_session_calldata(
        &self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: JsFelt,
    ) -> std::result::Result<JsValue, JsControllerError> {
        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;
        let call = self.controller.lock().await.register_session_call(
            methods,
            expires_at,
            public_key.0,
            Felt::ZERO,
        )?;

        Ok(to_value(&call.calldata)?)
    }

    #[wasm_bindgen(js_name = upgrade)]
    pub async fn upgrade(
        &self,
        new_class_hash: JsFelt,
    ) -> std::result::Result<JsCall, JsControllerError> {
        let call = self.controller.lock().await.upgrade(new_class_hash.0);
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
            .lock()
            .await
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

        let fee_estimate = self
            .controller
            .lock()
            .await
            .estimate_invoke_fee(calls)
            .await?;
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

        let result = Controller::execute(
            self.controller.lock().await.borrow_mut(),
            calls,
            details.max_fee,
        )
        .await?;

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
            .lock()
            .await
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
            .lock()
            .await
            .execute_from_outside_v3(calls)
            .await?;
        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = hasSession)]
    pub async fn has_session(&self, calls: Vec<JsCall>) -> Result<bool> {
        let calls: Vec<Call> = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<_, _>>()?;

        Ok(self
            .controller
            .lock()
            .await
            .session_account(&SdkPolicy::from_calls(&calls))
            .is_some())
    }

    #[wasm_bindgen(js_name = hasSessionForMessage)]
    pub async fn has_session_for_message(&self, typed_data: String) -> Result<bool> {
        let typed_data: TypedData = serde_json::from_str(&typed_data)?;
        let domain_hash = typed_data.domain.encode(&typed_data.types)?;
        let type_hash =
            &starknet_keccak(encode_type(&typed_data.primary_type, &typed_data.types)?.as_bytes());
        let scope_hash = poseidon_hash(domain_hash, *type_hash);

        Ok(self
            .controller
            .lock()
            .await
            .session_account(&[SdkPolicy::new_typed_data(scope_hash)])
            .is_some())
    }

    #[wasm_bindgen(js_name = getAuthorizedSessionMetadata)]
    pub async fn authorized_session_metadata(
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
            .lock()
            .await
            .authorized_session_metadata(&policies, public_key.map(|f| f.0))
            .map(|(_, metadata)| SessionMetadata::from(metadata)))
    }

    #[wasm_bindgen(js_name = isRequestedSession)]
    pub async fn is_requested_session(
        &self,
        policies: Vec<Policy>,
        public_key: Option<JsFelt>,
    ) -> std::result::Result<bool, JsControllerError> {
        let policies = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(self
            .controller
            .lock()
            .await
            .is_requested_session(&policies, public_key.map(|f| f.0)))
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
            .lock()
            .await
            .sign_message(serde_json::from_str(&typed_data)?)
            .await
            .map_err(|e| JsControllerError::from(ControllerError::SignError(e)))?;

        Ok(Felts(signature.into_iter().map(JsFelt).collect()))
    }

    #[wasm_bindgen(js_name = getNonce)]
    pub async fn get_nonce(&self) -> std::result::Result<JsValue, JsControllerError> {
        let nonce = self
            .controller
            .lock()
            .await
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
            .lock()
            .await
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
            .lock()
            .await
            .delegate_account()
            .await
            .map_err(JsControllerError::from)?;

        Ok(JsFelt(res))
    }
}

/// A type for accessing fixed attributes of `CartridgeAccount`.
///
/// This type exists as concurrent mutable and immutable calls to `CartridgeAccount` are guarded
/// with `WasmMutex`, which only operates under an `async` context. If these getters were directly
/// implemented under `CartridgeAccount`:
///
/// - calls to them would unnecessarily have to be `async` as well;
/// - there would be excessive locking.
///
/// This type is supposed to only ever be borrowed immutably. So no concurrent access control would
/// be needed.
#[wasm_bindgen]
#[derive(Clone)]
pub struct CartridgeAccountMeta {
    username: String,
    address: String,
    class_hash: String,
    rpc_url: String,
    chain_id: String,
    owner_guid: JsFelt,
}

impl CartridgeAccountMeta {
    fn new(controller: &Controller) -> Self {
        Self {
            username: controller.username.clone(),
            address: controller.address.to_hex_string(),
            class_hash: controller.class_hash.to_hex_string(),
            rpc_url: controller.rpc_url.to_string(),
            chain_id: controller.chain_id.to_string(),
            owner_guid: JsFelt(controller.owner_guid()),
        }
    }
}

#[wasm_bindgen]
impl CartridgeAccountMeta {
    #[wasm_bindgen(js_name = username)]
    pub fn username(&self) -> String {
        self.username.clone()
    }

    #[wasm_bindgen(js_name = address)]
    pub fn address(&self) -> String {
        self.address.clone()
    }

    #[wasm_bindgen(js_name = classHash)]
    pub fn class_hash(&self) -> String {
        self.class_hash.clone()
    }

    #[wasm_bindgen(js_name = rpcUrl)]
    pub fn rpc_url(&self) -> String {
        self.rpc_url.clone()
    }

    #[wasm_bindgen(js_name = chainId)]
    pub fn chain_id(&self) -> String {
        self.chain_id.clone()
    }

    #[wasm_bindgen(js_name = ownerGuid)]
    pub fn owner_guid(&self) -> JsFelt {
        self.owner_guid.clone()
    }
}

/// A type used as the return type for constructing `CartridgeAccount` to provide an extra,
/// separately borrowable `meta` field for synchronously accessing fixed fields.
///
/// This type exists instead of simply having `CartridgeAccount::new()` return a tuple as tuples
/// don't implement `IntoWasmAbi` which is needed for crossing JS-WASM boundary.
#[wasm_bindgen]
pub struct CartridgeAccountWithMeta {
    account: CartridgeAccount,
    meta: CartridgeAccountMeta,
}

impl CartridgeAccountWithMeta {
    fn new(controller: Controller) -> Self {
        let meta = CartridgeAccountMeta::new(&controller);
        Self {
            account: CartridgeAccount {
                controller: WasmMutex::new(controller),
            },
            meta,
        }
    }
}

#[wasm_bindgen]
impl CartridgeAccountWithMeta {
    #[wasm_bindgen(js_name = meta)]
    pub fn meta(&self) -> CartridgeAccountMeta {
        self.meta.clone()
    }

    #[wasm_bindgen(js_name = intoAccount)]
    pub fn into_account(self) -> CartridgeAccount {
        self.account
    }
}
