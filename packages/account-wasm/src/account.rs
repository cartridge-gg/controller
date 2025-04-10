use std::borrow::BorrowMut;

use account_sdk::controller::{compute_gas_and_price, Controller};
use account_sdk::errors::ControllerError;
use account_sdk::typed_data::TypedData;
use serde_wasm_bindgen::to_value;
use starknet::accounts::ConnectedAccount;
use starknet::core::types::Call;

use starknet_types_core::felt::Felt;
use url::Url;
use wasm_bindgen::prelude::*;

use crate::errors::JsControllerError;
use crate::storage::PolicyStorage;
use crate::sync::WasmMutex;
use crate::types::call::JsCall;
use crate::types::estimate::JsFeeEstimate;
use crate::types::owner::Owner;
use crate::types::policy::{CallPolicy, Policy, TypedDataPolicy};
use crate::types::session::AuthorizedSession;
use crate::types::{Felts, JsFeeSource, JsFelt};
use crate::utils::set_panic_hook;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeAccount {
    controller: WasmMutex<Controller>,
    policy_storage: WasmMutex<PolicyStorage>,
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
    /// - `owner`: A Owner struct containing the owner signer and associated data.
    ///
    #[allow(clippy::new_ret_no_self)]
    pub fn new(
        app_id: String,
        class_hash: JsFelt,
        rpc_url: String,
        chain_id: JsFelt,
        address: JsFelt,
        username: String,
        owner: Owner,
    ) -> Result<CartridgeAccountWithMeta> {
        set_panic_hook();

        let rpc_url = Url::parse(&rpc_url)?;
        let username = username.to_lowercase();

        let controller = Controller::new(
            app_id,
            username.clone(),
            class_hash.try_into()?,
            rpc_url,
            owner.into(),
            address.try_into()?,
            chain_id.try_into()?,
        );

        Ok(CartridgeAccountWithMeta::new(controller))
    }

    #[wasm_bindgen(js_name = fromStorage)]
    pub fn from_storage(app_id: String) -> Result<Option<CartridgeAccountWithMeta>> {
        set_panic_hook();

        let controller =
            Controller::from_storage(app_id).map_err(|e| JsError::new(&e.to_string()))?;

        Ok(controller.map(CartridgeAccountWithMeta::new))
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
        max_fee: Option<JsFeeEstimate>,
    ) -> std::result::Result<JsValue, JsControllerError> {
        let methods = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let max_fee = max_fee.map(|fee| fee.try_into()).transpose()?;
        let res = self
            .controller
            .lock()
            .await
            .register_session(
                methods,
                expires_at,
                public_key.try_into()?,
                Felt::ZERO,
                max_fee,
            )
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
            public_key.try_into()?,
            Felt::ZERO,
        )?;

        Ok(to_value(&call.calldata)?)
    }

    #[wasm_bindgen(js_name = upgrade)]
    pub async fn upgrade(
        &self,
        new_class_hash: JsFelt,
    ) -> std::result::Result<JsCall, JsControllerError> {
        let felt: Felt = new_class_hash.try_into()?;
        let call = self.controller.lock().await.upgrade(felt);
        Ok(JsCall {
            contract_address: call.to.into(),
            entrypoint: "upgrade".to_string(),
            calldata: call.calldata.into_iter().map(Into::into).collect(),
        })
    }

    #[wasm_bindgen(js_name = login)]
    pub async fn login(
        &self,
        expires_at: u64,
    ) -> std::result::Result<AuthorizedSession, JsControllerError> {
        set_panic_hook();

        let account = self
            .controller
            .lock()
            .await
            .create_wildcard_session(expires_at)
            .await?;

        let session_metadata = AuthorizedSession {
            session: account.session.clone().into(),
            authorization: Some(
                account
                    .session_authorization
                    .clone()
                    .into_iter()
                    .map(Into::into)
                    .collect(),
            ),
            is_registered: false,
        };

        Ok(session_metadata)
    }

    #[wasm_bindgen(js_name = createSession)]
    pub async fn create_session(
        &self,
        policies: Vec<Policy>,
        expires_at: u64,
    ) -> std::result::Result<Option<AuthorizedSession>, JsControllerError> {
        set_panic_hook();

        let mut controller = self.controller.lock().await;

        let wildcard_exists = controller
            .authorized_session()
            .filter(|session| session.is_wildcard())
            .is_some();

        let session = if !wildcard_exists {
            let account = controller.create_wildcard_session(expires_at).await?;
            let session_metadata = AuthorizedSession {
                session: account.session.clone().into(),
                authorization: Some(
                    account
                        .session_authorization
                        .clone()
                        .into_iter()
                        .map(Into::into)
                        .collect(),
                ),
                is_registered: false,
            };
            Some(session_metadata)
        } else {
            None
        };

        self.policy_storage.lock().await.store(policies.clone())?;

        Ok(session)
    }

    #[wasm_bindgen(js_name = skipSession)]
    pub async fn skip_session(
        &self,
        policies: Vec<Policy>,
    ) -> std::result::Result<(), JsControllerError> {
        set_panic_hook();

        // Convert policies to have authorization explicitly set to false
        let unauthorized_policies = policies
            .into_iter()
            .map(|policy| match policy {
                Policy::Call(call_policy) => Policy::Call(CallPolicy {
                    target: call_policy.target,
                    method: call_policy.method,
                    authorized: Some(false),
                }),
                Policy::TypedData(td_policy) => Policy::TypedData(TypedDataPolicy {
                    scope_hash: td_policy.scope_hash,
                    authorized: Some(false),
                }),
            })
            .collect();

        self.policy_storage
            .lock()
            .await
            .store(unauthorized_policies)?;

        Ok(())
    }

    #[wasm_bindgen(js_name = estimateInvokeFee)]
    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<JsCall>,
    ) -> std::result::Result<JsFeeEstimate, JsControllerError> {
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

        Ok(fee_estimate.into())
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &self,
        calls: Vec<JsCall>,
        max_fee: Option<JsFeeEstimate>,
        fee_source: Option<JsFeeSource>,
    ) -> std::result::Result<JsValue, JsControllerError> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let result = Controller::execute(
            self.controller.lock().await.borrow_mut(),
            calls,
            max_fee.map(|fee| fee.try_into()).transpose()?,
            fee_source.map(|fs| fs.try_into()).transpose()?,
        )
        .await?;

        Ok(to_value(&result)?)
    }

    #[wasm_bindgen(js_name = executeFromOutsideV2)]
    pub async fn execute_from_outside_v2(
        &self,
        calls: Vec<JsCall>,
        fee_source: Option<JsFeeSource>,
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
            .execute_from_outside_v2(calls, fee_source.map(|fs| fs.try_into()).transpose()?)
            .await?;
        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = executeFromOutsideV3)]
    pub async fn execute_from_outside_v3(
        &self,
        calls: Vec<JsCall>,
        fee_source: Option<JsFeeSource>,
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
            .execute_from_outside_v3(calls, fee_source.map(|fs| fs.try_into()).transpose()?)
            .await?;
        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = isRegisteredSessionAuthorized)]
    pub async fn is_registered_session_authorized(
        &self,
        policies: Vec<Policy>,
        public_key: Option<JsFelt>,
    ) -> std::result::Result<Option<AuthorizedSession>, JsControllerError> {
        let policies = policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(self
            .controller
            .lock()
            .await
            .authorized_session_for_policies(
                &policies,
                public_key.map(|f| f.try_into()).transpose()?,
            )
            .map(AuthorizedSession::from))
    }

    #[wasm_bindgen(js_name = hasRequestedSession)]
    pub async fn has_requested_session(
        &self,
        policies: Vec<Policy>,
    ) -> std::result::Result<bool, JsControllerError> {
        if !self.policy_storage.lock().await.is_requested(&policies)? {
            // If not requested locally, we don't need to check the session
            return Ok(false);
        }

        let controller_guard = self.controller.lock().await;
        Ok(controller_guard.authorized_session().is_some())
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

        Ok(Felts(signature.into_iter().map(Into::into).collect()))
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
    pub async fn deploy_self(&self, max_fee: Option<JsFeeEstimate>) -> Result<JsValue> {
        set_panic_hook();

        let controller = self.controller.lock().await;
        let mut deployment = controller.deploy();

        if let Some(max_fee) = max_fee {
            let gas_estimate_multiplier = 1.5;
            let (gas, gas_price) =
                compute_gas_and_price(&max_fee.try_into()?, gas_estimate_multiplier)?;
            deployment = deployment.gas(gas).gas_price(gas_price);
        }

        let res = deployment
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

        Ok(res.into())
    }

    #[wasm_bindgen(js_name = hasAuthorizedPoliciesForCalls)]
    pub async fn has_authorized_policies_for_calls(&self, calls: Vec<JsCall>) -> Result<bool> {
        let calls: Vec<Call> = calls
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<std::result::Result<_, _>>()?;

        let policies: Vec<_> = calls.iter().map(Policy::from_call).collect();

        // Check local policy authorization
        if !self.policy_storage.lock().await.is_authorized(&policies)? {
            return Ok(false);
        }

        let controller_guard = self.controller.lock().await;
        Ok(controller_guard.authorized_session().is_some())
    }

    #[wasm_bindgen(js_name = hasAuthorizedPoliciesForMessage)]
    pub async fn has_authorized_policies_for_message(&self, typed_data: String) -> Result<bool> {
        let typed_data_obj: TypedData = serde_json::from_str(&typed_data)?;
        let policy = Policy::from_typed_data(&typed_data_obj)?;

        // Check local policy authorization
        if !self.policy_storage.lock().await.is_authorized(&[policy])? {
            return Ok(false);
        }

        let controller_guard = self.controller.lock().await;
        Ok(controller_guard.authorized_session().is_some())
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
    app_id: String,
    username: String,
    address: String,
    class_hash: String,
    rpc_url: String,
    chain_id: String,
    owner_guid: JsFelt,
    owner: Owner,
}

impl CartridgeAccountMeta {
    fn new(controller: &Controller) -> Self {
        Self {
            app_id: controller.app_id.clone(),
            username: controller.username.clone(),
            address: controller.address.to_hex_string(),
            class_hash: controller.class_hash.to_hex_string(),
            rpc_url: controller.rpc_url.to_string(),
            chain_id: controller.chain_id.to_hex_string(),
            owner_guid: controller.owner_guid().into(),
            owner: controller.owner.clone().into(),
        }
    }
}

#[wasm_bindgen]
impl CartridgeAccountMeta {
    #[wasm_bindgen(js_name = appId)]
    pub fn app_id(&self) -> String {
        self.app_id.clone()
    }

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

    #[wasm_bindgen(js_name = owner)]
    pub fn owner(&self) -> Owner {
        self.owner.clone()
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
        let policy_storage = PolicyStorage::new(
            &controller.address,
            &controller.app_id,
            &controller.chain_id,
        );

        Self {
            account: CartridgeAccount {
                controller: WasmMutex::new(controller),
                policy_storage: WasmMutex::new(policy_storage),
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
