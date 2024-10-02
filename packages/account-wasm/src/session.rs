use account_sdk::abigen::controller::OutsideExecution;
use account_sdk::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use account_sdk::account::session::SessionAccount;
use account_sdk::account::AccountHashAndCallsSigner;
use account_sdk::provider::{CartridgeJsonRpcProvider, CartridgeProvider};
use account_sdk::signers::{HashSigner, Signer};
use serde_wasm_bindgen::to_value;
use starknet::accounts::{Account, ConnectedAccount};
use starknet::signers::SigningKey;
use url::Url;
use wasm_bindgen::prelude::*;

use crate::types::call::JsCall;
use crate::types::session::Session;
use crate::types::{Felts, JsFelt};

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
pub struct CartridgeSessionAccount(SessionAccount);

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
            provider,
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
            provider,
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
