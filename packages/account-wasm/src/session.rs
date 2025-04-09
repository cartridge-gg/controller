use account_sdk::abigen::controller::OutsideExecutionV3;
use account_sdk::account::outside_execution::{
    OutsideExecution, OutsideExecutionAccount, OutsideExecutionCaller,
};
use account_sdk::account::session::account::SessionAccount;
use account_sdk::account::AccountHashAndCallsSigner;
use account_sdk::provider::{CartridgeJsonRpcProvider, CartridgeProvider};
use account_sdk::signers::Signer;
use chrono::Utc;
use serde_wasm_bindgen::to_value;
use starknet::accounts::{Account, ConnectedAccount};
use starknet::signers::SigningKey;
use starknet_types_core::felt::Felt;

use std::result::Result;
use url::Url;
use wasm_bindgen::prelude::*;

use crate::errors::JsControllerError;
use crate::sync::WasmMutex;
use crate::types::call::JsCall;
use crate::types::session::Session;
use crate::types::{Felts, JsFelt};

#[wasm_bindgen]
pub struct CartridgeSessionAccount(WasmMutex<SessionAccount>);

#[wasm_bindgen]
impl CartridgeSessionAccount {
    pub fn new(
        rpc_url: String,
        signer: JsFelt,
        address: JsFelt,
        chain_id: JsFelt,
        session_authorization: Vec<JsFelt>,
        session: Session,
    ) -> Result<CartridgeSessionAccount, JsControllerError> {
        let rpc_url = Url::parse(&rpc_url)?;
        let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

        let signer = Signer::Starknet(SigningKey::from_secret_scalar(signer.try_into()?));
        let address = address.try_into()?;
        let chain_id = chain_id.try_into()?;

        let session_authorization: Result<Vec<Felt>, _> = session_authorization
            .into_iter()
            .map(TryInto::try_into)
            .collect();
        let session_authorization = session_authorization?;
        let policies = session
            .policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<Result<Vec<_>, _>>()?;

        let session = account_sdk::account::session::hash::Session::new(
            policies,
            session.expires_at,
            &signer.clone().into(),
            Felt::ZERO,
        )?;

        Ok(CartridgeSessionAccount(WasmMutex::new(
            SessionAccount::new(
                provider,
                signer,
                address,
                chain_id,
                session_authorization,
                session,
            ),
        )))
    }

    #[wasm_bindgen(js_name = newAsRegistered)]
    pub fn new_as_registered(
        rpc_url: String,
        signer: JsFelt,
        address: JsFelt,
        owner_guid: JsFelt,
        chain_id: JsFelt,
        session: Session,
    ) -> Result<CartridgeSessionAccount, JsControllerError> {
        let rpc_url = Url::parse(&rpc_url)?;
        let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());

        let signer = Signer::Starknet(SigningKey::from_secret_scalar(signer.try_into()?));
        let address = address.try_into()?;
        let chain_id = chain_id.try_into()?;

        let policies = session
            .policies
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<Result<Vec<_>, _>>()?;

        let session = account_sdk::account::session::hash::Session::new(
            policies,
            session.expires_at,
            &signer.clone().into(),
            Felt::ZERO,
        )?;

        Ok(CartridgeSessionAccount(WasmMutex::new(
            SessionAccount::new_as_registered(
                provider,
                signer,
                address,
                chain_id,
                owner_guid.try_into()?,
                session,
            ),
        )))
    }

    pub async fn sign(&self, hash: JsFelt, calls: Vec<JsCall>) -> Result<Felts, JsControllerError> {
        let hash = hash.try_into()?;
        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<Result<Vec<_>, _>>()?;

        let res = self
            .0
            .lock()
            .await
            .sign_hash_and_calls(hash, &calls)
            .await?;

        Ok(Felts(res.into_iter().map(Into::into).collect()))
    }

    pub async fn execute(&self, calls: Vec<JsCall>) -> Result<JsValue, JsControllerError> {
        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<Result<Vec<_>, _>>()?;

        let session = self.0.lock().await;
        let result = session.execute_v3(calls.clone()).send().await?;

        Ok(to_value(&result)?)
    }

    #[wasm_bindgen(js_name = executeFromOutside)]
    pub async fn execute_from_outside(
        &self,
        calls: Vec<JsCall>,
    ) -> Result<JsValue, JsControllerError> {
        let caller = OutsideExecutionCaller::Any;
        let calls = calls
            .into_iter()
            .map(TryInto::try_into)
            .collect::<Result<Vec<_>, _>>()?;

        let now = Utc::now().timestamp() as u64;
        let outside_execution = OutsideExecutionV3 {
            caller: caller.into(),
            execute_after: 0_u64,
            execute_before: now + 600,
            calls,
            nonce: (SigningKey::from_random().secret_scalar(), 1),
        };

        let session = self.0.lock().await;
        let signed = session
            .sign_outside_execution(OutsideExecution::V3(outside_execution.clone()))
            .await?;

        let res = session
            .provider()
            .add_execute_outside_transaction(
                OutsideExecution::V3(outside_execution),
                session.address(),
                signed.signature,
            )
            .await?;

        Ok(to_value(&res)?)
    }
}
