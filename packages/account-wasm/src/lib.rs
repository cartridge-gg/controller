mod types;
mod utils;

use std::str::FromStr;

use account_sdk::account::session::hash::{AllowedMethod, Session};
use account_sdk::account::session::SessionAccount;
use account_sdk::account::{AccountHashSigner, CartridgeGuardianAccount, MessageSignerAccount};
use account_sdk::hash::MessageHashRev1;
use account_sdk::signers::webauthn::device::DeviceSigner;
use account_sdk::signers::HashSigner;
use account_sdk::wasm_webauthn::CredentialID;
use base64::{engine::general_purpose, Engine};
use coset::{CborSerializable, CoseKey};
use serde_wasm_bindgen::{from_value, to_value};
use starknet::accounts::Account;
use starknet::macros::short_string;
use starknet::signers::SigningKey;
use starknet::{
    accounts::Call,
    core::types::FieldElement,
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
};
use types::{JsCall, JsCredentials, JsInvocationsDetails, JsPolicy, JsSession};
use url::Url;
use wasm_bindgen::prelude::*;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeAccount {
    account: CartridgeGuardianAccount<JsonRpcClient<HttpTransport>, DeviceSigner, SigningKey>,
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
    ) -> Result<CartridgeAccount> {
        utils::set_panic_hook();
        let rpc_url = Url::parse(&rpc_url)?;
        let provider = JsonRpcClient::new(HttpTransport::new(rpc_url.clone()));

        let credential_id_bytes = general_purpose::URL_SAFE_NO_PAD.decode(credential_id)?;
        let credential_id = CredentialID(credential_id_bytes);

        let cose_bytes = general_purpose::URL_SAFE_NO_PAD.decode(public_key)?;
        let cose = CoseKey::from_slice(&cose_bytes)?;

        let webauthn_signer = DeviceSigner::new(rp_id, origin, credential_id, cose);

        let dummy_guardian = SigningKey::from_secret_scalar(short_string!("CARTRIDGE_GUARDIAN"));
        let address = FieldElement::from_str(&address)?;
        let chain_id = FieldElement::from_str(&chain_id)?;

        let account = CartridgeGuardianAccount::new(
            provider,
            webauthn_signer,
            dummy_guardian,
            address,
            chain_id,
        );

        Ok(CartridgeAccount { account, rpc_url })
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
            .map(|js_value| {
                let policy = JsPolicy::try_from(js_value)?;
                let method = AllowedMethod::try_from(policy)?;
                Ok(method)
            })
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
            .map(|js_value| {
                let js_call = JsCall::try_from(js_value)?;
                let call = Call::try_from(js_call)?;
                Ok(call)
            })
            .collect::<Result<Vec<Call>>>()?;

        let details: JsInvocationsDetails = JsInvocationsDetails::try_from(transaction_details)?;

        let session_details: Option<JsSession> = from_value(session_details)?;
        let execution = if let Some(session_details) = session_details {
            let methods = session_details
                .policies
                .into_iter()
                .map(|policy| Ok(AllowedMethod::try_from(policy)?))
                .collect::<Result<Vec<AllowedMethod>>>()?;

            let dummy_guardian =
                SigningKey::from_secret_scalar(short_string!("CARTRIDGE_GUARDIAN"));
            let session_signer =
                SigningKey::from_secret_scalar(session_details.credentials.private_key);
            let expires_at: u64 = session_details.expires_at.parse()?;
            let session = Session::new(methods, expires_at, &session_signer.signer())?;

            let session_account = SessionAccount::new(
                JsonRpcClient::new(HttpTransport::new(self.rpc_url.clone())),
                session_signer,
                dummy_guardian,
                self.account.address(),
                self.account.chain_id(),
                session_details.credentials.authorization,
                session.clone(),
            );

            session_account
                .execute(calls)
                .max_fee(details.max_fee)
                .nonce(details.nonce)
                .send()
                .await?
        } else {
            self.account
                .execute(calls)
                .max_fee(details.max_fee)
                .nonce(details.nonce)
                .send()
                .await?
        };

        Ok(to_value(&execution)?)
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
}
