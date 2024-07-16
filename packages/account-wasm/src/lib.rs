mod constants;
mod errors;
mod paymaster;
mod types;
mod utils;

#[allow(dead_code)]
mod factory;

#[cfg(test)]
mod tests;

use std::str::FromStr;
use std::sync::Arc;

use account_sdk::abigen::controller::WebauthnSigner;
use account_sdk::account::outside_execution::OutsideExecutionAccount;
use account_sdk::account::session::hash::{AllowedMethod, Session};
use account_sdk::account::session::SessionAccount;
use account_sdk::account::{AccountHashSigner, CartridgeGuardianAccount, MessageSignerAccount};
use account_sdk::hash::MessageHashRev1;
use account_sdk::signers::webauthn::device::DeviceSigner;
use account_sdk::signers::webauthn::WebauthnAccountSigner;
use account_sdk::signers::HashSigner;
use account_sdk::wasm_webauthn::CredentialID;
use base64::{engine::general_purpose, Engine};
use cainome::cairo_serde::CairoSerde;
use constants::ACCOUNT_CLASS_HASH;
use coset::{CborSerializable, CoseKey};
use errors::{OperationError, SessionError};
use factory::cartridge::CartridgeAccountFactory;
use factory::AccountDeployment;
use paymaster::PaymasterRequest;
use serde_wasm_bindgen::{from_value, to_value};
use starknet::accounts::{Account, ConnectedAccount};
use starknet::core::types::{BlockId, BlockTag, FunctionCall};
use starknet::core::utils as starknetutils;
use starknet::macros::{selector, short_string};
use starknet::providers::Provider;
use starknet::signers::SigningKey;
use starknet::{
    accounts::Call,
    core::types::Felt,
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
};
use types::call::JsCall;
use types::invocation::JsInvocationsDetails;
use types::outside_execution::JsOutsideExecution;
use types::session::{JsCredentials, JsSession};
use url::Url;
use utils::{policies_match, set_panic_hook};
use wasm_bindgen::prelude::*;

use crate::types::TryFromJsValue;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeAccount {
    account: CartridgeGuardianAccount<Arc<JsonRpcClient<HttpTransport>>, DeviceSigner, SigningKey>,
    device_signer: DeviceSigner,
    username: String,
    rpc_url: Url,
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
    /// - `username`: Username associated with the account.
    /// - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
    /// - `public_key`: Base64 encoded bytes of the public key generated during the WebAuthn registration process (COSE format).
    ///
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        rpc_url: String,
        chain_id: String,
        address: String,
        rp_id: String,
        origin: String,
        username: String,
        credential_id: String,
        public_key: String,
    ) -> Result<CartridgeAccount> {
        set_panic_hook();

        let rpc_url = Url::parse(&rpc_url)?;
        let provider = JsonRpcClient::new(HttpTransport::new(rpc_url.clone()));

        let credential_id_bytes = general_purpose::URL_SAFE_NO_PAD.decode(credential_id)?;
        let credential_id = CredentialID(credential_id_bytes);

        let cose_bytes = general_purpose::URL_SAFE_NO_PAD.decode(public_key)?;
        let cose = CoseKey::from_slice(&cose_bytes)?;

        let device_signer = DeviceSigner::new(rp_id, origin, credential_id, cose);

        let dummy_guardian = SigningKey::from_secret_scalar(short_string!("CARTRIDGE_GUARDIAN"));
        let address = Felt::from_str(&address)?;
        let chain_id = Felt::from_str(&chain_id)?;

        let account = CartridgeGuardianAccount::new(
            Arc::new(provider),
            device_signer.clone(),
            dummy_guardian,
            address,
            chain_id,
        );

        Ok(CartridgeAccount {
            account,
            device_signer,
            username,
            rpc_url,
        })
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

        let signer = SigningKey::from_random();
        let session =
            Session::new(methods, expires_at, &signer.signer()).map_err(SessionError::Creation)?;

        let hash = session
            .raw()
            .get_message_hash_rev_1(self.account.chain_id(), self.account.address());

        let authorization = self
            .account
            .sign_hash(hash)
            .await
            .map_err(SessionError::Signing)?;

        Ok(to_value(&JsCredentials {
            authorization,
            private_key: signer.secret_scalar(),
        })?)
    }

    #[wasm_bindgen(js_name = estimateInvokeFee)]
    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<JsValue>,
        session_details: JsValue,
        fee_multiplier: Option<f64>,
    ) -> Result<JsValue> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let multipler = fee_multiplier.unwrap_or(1.0);
        let session_details: Option<JsSession> = from_value(session_details)?;
        let result = match self.get_session_account(&calls, session_details).await? {
            Some(session_account) => {
                session_account
                    .execute_v1(calls)
                    .fee_estimate_multiplier(multipler)
                    .estimate_fee()
                    .await
            }
            _ => {
                self.account
                    .execute_v1(calls)
                    .fee_estimate_multiplier(multipler)
                    .estimate_fee()
                    .await
            }
        };

        let fee_estimate =
            result.map_err(|e| OperationError::FeeEstimation(format!("{:#?}", e)))?;

        Ok(to_value(&fee_estimate)?)
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &self,
        calls: Vec<JsValue>,
        transaction_details: JsValue,
        session_details: JsValue,
    ) -> Result<JsValue> {
        set_panic_hook();

        let calls = calls
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        let details = JsInvocationsDetails::try_from(transaction_details)?;
        let session_details: Option<JsSession> = from_value(session_details)?;
        let result = match self.get_session_account(&calls, session_details).await? {
            Some(session_account) => {
                session_account
                    .execute_v1(calls)
                    .max_fee(details.max_fee)
                    .nonce(details.nonce)
                    .send()
                    .await
            }
            _ => {
                self.account
                    .execute_v1(calls)
                    .max_fee(details.max_fee)
                    .nonce(details.nonce)
                    .send()
                    .await
            }
        };

        let execution = result.map_err(|e| OperationError::Execution(format!("{:#?}", e)))?;

        Ok(to_value(&execution)?)
    }

    #[wasm_bindgen(js_name = executeFromOutside)]
    pub async fn execute_from_outside(
        &self,
        calls: Vec<JsValue>,
        caller: JsValue,
        session_details: JsValue,
    ) -> Result<JsValue> {
        set_panic_hook();

        let rs_calls: Vec<Call> = calls
            .clone()
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<std::result::Result<_, _>>()?;

        let js_calls: Vec<JsCall> = calls
            .into_iter()
            .map(JsCall::try_from)
            .collect::<std::result::Result<_, _>>()?;

        let outside = JsOutsideExecution {
            caller: serde_wasm_bindgen::from_value(caller)?,
            execute_after: 0_u64,
            execute_before: 3000000000_u64,
            calls: js_calls,
            nonce: SigningKey::from_random().secret_scalar(),
        };

        let session_details: Option<JsSession> = from_value(session_details)?;
        let signed = match self.get_session_account(&rs_calls, session_details).await? {
            Some(session_account) => {
                session_account
                    .sign_outside_execution(outside.clone().try_into()?)
                    .await?
            }
            _ => {
                self.account
                    .sign_outside_execution(outside.clone().try_into()?)
                    .await?
            }
        };

        let response = PaymasterRequest::send(
            self.rpc_url.clone(),
            outside,
            self.account.address(),
            self.account.chain_id(),
            signed.signature,
        )
        .await?;

        Ok(to_value(&response)?)
    }

    #[wasm_bindgen(js_name = revokeSession)]
    pub fn revoke_session(&self) -> Result<()> {
        unimplemented!("Revoke Session not implemented");
    }

    #[wasm_bindgen(js_name = signMessage)]
    pub async fn sign_message(&self, typed_data: String) -> Result<JsValue> {
        set_panic_hook();

        let signature = self
            .account
            .sign_message(serde_json::from_str(&typed_data)?)
            .await
            .map_err(OperationError::SignMessage)?;

        Ok(to_value(&signature)?)
    }

    #[wasm_bindgen(js_name = deploySelf)]
    pub async fn deploy_self(&self, max_fee: JsValue) -> Result<JsValue> {
        set_panic_hook();

        let webauthn_calldata = self.device_signer.signer_pub_data();
        let mut constructor_calldata =
            Vec::<WebauthnSigner>::cairo_serialize(&vec![webauthn_calldata]);
        constructor_calldata[0] = Felt::TWO; // incorrect signer enum from serialization
        constructor_calldata.push(Felt::ONE); // no guardian

        let factory = CartridgeAccountFactory::new(
            Felt::from_str(ACCOUNT_CLASS_HASH)?,
            self.account.chain_id(),
            constructor_calldata,
            self.account.clone(),
            self.account.provider(),
        );

        let deployment = AccountDeployment::new(
            starknetutils::cairo_short_string_to_felt(&self.username)?,
            &factory,
        );
        let res = deployment
            .max_fee(from_value(max_fee)?)
            .send()
            .await
            .map_err(|e| OperationError::Deployment(format!("{:#?}", e)))?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = delegateAccount)]
    pub async fn delegate_account(&self) -> Result<JsValue> {
        set_panic_hook();

        let res = self
            .account
            .provider()
            .call(
                FunctionCall {
                    contract_address: self.account.address(),
                    entry_point_selector: selector!("delegate_account"),
                    calldata: vec![],
                },
                BlockId::Tag(BlockTag::Pending),
            )
            .await
            .map_err(|e| OperationError::Delegation(e.to_string()))?;

        Ok(to_value(&res[0])?)
    }

    async fn get_session_account(
        &self,
        calls: &[Call],
        session_details: Option<JsSession>,
    ) -> Result<Option<SessionAccount<JsonRpcClient<HttpTransport>, SigningKey, SigningKey>>> {
        set_panic_hook();

        let Some(session_details) = session_details else {
            return Ok(None);
        };

        if !policies_match(calls, &session_details.policies) {
            return Ok(None);
        }

        let methods = session_details
            .policies
            .clone()
            .into_iter()
            .map(|policy| Ok(AllowedMethod::try_from(policy)?))
            .collect::<Result<Vec<AllowedMethod>>>()?;

        let dummy_guardian = SigningKey::from_secret_scalar(short_string!("CARTRIDGE_GUARDIAN"));
        let session_signer =
            SigningKey::from_secret_scalar(session_details.credentials.private_key);
        let expires_at: u64 = session_details.expires_at.parse()?;
        let session = Session::new(methods, expires_at, &session_signer.signer())
            .map_err(SessionError::Creation)?;

        let session_account = SessionAccount::new(
            JsonRpcClient::new(HttpTransport::new(self.rpc_url.clone())),
            session_signer,
            dummy_guardian,
            self.account.address(),
            self.account.chain_id(),
            session_details.credentials.authorization,
            session,
        );

        Ok(Some(session_account))
    }
}
