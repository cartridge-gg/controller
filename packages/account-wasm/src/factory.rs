use account_sdk::{
    constants::ACCOUNT_CLASS_HASH, factory::ControllerFactory, provider::CartridgeJsonRpcProvider,
    signers::webauthn::WebauthnSigner,
};
use starknet::{core::types::Felt, signers::SigningKey};
use std::{str::FromStr, sync::Arc};
use wasm_bindgen::prelude::*;

use crate::{signer::BrowserBackend, CartridgeAccount};

#[wasm_bindgen]
pub struct JsControllerFactory {
    inner: ControllerFactory<S, Arc<CartridgeJsonRpcProvider>>,
}

#[wasm_bindgen]
impl JsControllerFactory {
    pub fn new(inner: ControllerFactory<S, Arc<CartridgeJsonRpcProvider>>) -> Self {
        Self { inner }
    }

    #[wasm_bindgen(js_name = deploy)]
    pub async fn deploy(
        &self,
        account: &CartridgeAccount,
        max_fee: String,
    ) -> Result<JsValue, JsValue> {
        self.inner.deploy()
    }
}

#[wasm_bindgen]
impl CartridgeAccount {
    #[wasm_bindgen(js_name = getFactory)]
    pub fn factory(&self) -> JsControllerFactory {
        let factory = ControllerFactory::new(
            ACCOUNT_CLASS_HASH,
            self.controller.chain_id,
            self.controller.owner.clone(),
            None,
            self.controller.provider.clone(),
        );

        JsControllerFactory::new(factory)
    }
}
