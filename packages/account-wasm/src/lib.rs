mod constants;
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
use types::estimate::JsEstimateFeeDetails;
use types::invocation::JsInvocationsDetails;
use types::outside_execution::JsOutsideExecution;
use types::session::{JsCredentials, JsSession};
use url::Url;
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
        utils::set_panic_hook();
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
        utils::set_panic_hook();

        let methods = policies
            .into_iter()
            .map(AllowedMethod::try_from_js_value)
            .collect::<Result<Vec<AllowedMethod>>>()?;

        let signer = SigningKey::from_random();
        let session = Session::new(methods, expires_at, &signer.signer())?;

        let hash = session
            .raw()
            .get_message_hash_rev_1(self.account.chain_id(), self.account.address());

        let authorization = self.account.sign_hash(hash).await?;

        Ok(to_value(&JsCredentials {
            authorization,
            private_key: signer.secret_scalar(),
        })?)
    }

    #[wasm_bindgen(js_name = estimateInvokeFee)]
    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<JsValue>,
        estimate_details: JsValue,
        session_details: JsValue,
    ) -> Result<JsValue> {
        utils::set_panic_hook();

        let calls = calls
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<Result<Vec<Call>>>()?;

        let details = JsEstimateFeeDetails::try_from(estimate_details)?;
        let fee_estimate = if let Some(session_details) = from_value(session_details)? {
            self.session_account(session_details)
                .await?
                .execute_v1(calls)
                .nonce(details.nonce)
                .estimate_fee()
                .await?
        } else {
            self.account
                .execute_v1(calls)
                .nonce(details.nonce)
                .estimate_fee()
                .await?
        };

        Ok(to_value(&fee_estimate)?)
    }

    #[wasm_bindgen(js_name = execute)]
    pub async fn execute(
        &self,
        calls: Vec<JsValue>,
        transaction_details: JsValue,
        session_details: JsValue,
    ) -> Result<JsValue> {
        utils::set_panic_hook();

        let calls = calls
            .into_iter()
            .map(Call::try_from_js_value)
            .collect::<Result<Vec<Call>>>()?;

        let details = JsInvocationsDetails::try_from(transaction_details)?;
        let execution = if let Some(session_details) = from_value(session_details)? {
            self.session_account(session_details)
                .await?
                .execute_v1(calls)
                .max_fee(details.max_fee)
                .nonce(details.nonce)
                .send()
                .await?
        } else {
            self.account
                .execute_v1(calls)
                .max_fee(details.max_fee)
                .nonce(details.nonce)
                .send()
                .await?
        };

        Ok(to_value(&execution)?)
    }

    #[wasm_bindgen(js_name = executeFromOutside)]
    pub async fn execute_from_outside(
        &self,
        calls: Vec<JsValue>,
        caller: JsValue,
        session_details: JsValue,
    ) -> Result<JsValue> {
        utils::set_panic_hook();

        let outside = JsOutsideExecution {
            caller: serde_wasm_bindgen::from_value(caller)?,
            execute_after: 0_u64,
            execute_before: 3000000000_u64,
            calls: calls
                .into_iter()
                .map(JsCall::try_from)
                .collect::<Result<Vec<JsCall>>>()?,
            nonce: SigningKey::from_random().secret_scalar(),
        };

        let signed = if let Some(session_details) = from_value(session_details)? {
            self.session_account(session_details)
                .await?
                .sign_outside_execution(outside.clone().try_into()?)
                .await?
        } else {
            self.account
                .sign_outside_execution(outside.clone().try_into()?)
                .await?
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
        let signature = self
            .account
            .sign_message(serde_json::from_str(&typed_data)?)
            .await?;
        Ok(to_value(&signature)?)
    }

    #[wasm_bindgen(js_name = deploySelf)]
    pub async fn deploy_self(&self, max_fee: JsValue) -> Result<JsValue> {
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
        let res: starknet::core::types::DeployAccountTransactionResult =
            deployment.max_fee(from_value(max_fee)?).send().await?;

        Ok(to_value(&res)?)
    }

    #[wasm_bindgen(js_name = delegateAccount)]
    pub async fn delegate_account(&self) -> Result<JsValue> {
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
            .await?;
        Ok(to_value(&res[0])?)
    }

    async fn session_account(
        &self,
        details: JsSession,
    ) -> Result<SessionAccount<JsonRpcClient<HttpTransport>, SigningKey, SigningKey>> {
        let methods = details
            .policies
            .into_iter()
            .map(|policy| Ok(AllowedMethod::try_from(policy)?))
            .collect::<Result<Vec<AllowedMethod>>>()?;

        let dummy_guardian = SigningKey::from_secret_scalar(short_string!("CARTRIDGE_GUARDIAN"));
        let session_signer = SigningKey::from_secret_scalar(details.credentials.private_key);
        let expires_at: u64 = details.expires_at.parse()?;
        let session = Session::new(methods, expires_at, &session_signer.signer())?;

        Ok(SessionAccount::new(
            JsonRpcClient::new(HttpTransport::new(self.rpc_url.clone())),
            session_signer,
            dummy_guardian,
            self.account.address(),
            self.account.chain_id(),
            details.credentials.authorization,
            session,
        ))
    }
}
