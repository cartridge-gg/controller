use async_trait::async_trait;

use account_sdk::{
    controller::Backend,
    signers::{webauthn::WebauthnBackend, DeviceError},
    storage::{StorageBackend, StorageError, StorageValue},
    OriginProvider,
};
use futures::channel::oneshot;
use serde_json::to_value;
use wasm_bindgen::UnwrapThrowExt;
use wasm_bindgen_futures::{spawn_local, JsFuture};
use web_sys::{console, Window};
use webauthn_rs_proto::{
    auth::PublicKeyCredentialRequestOptions, CreationChallengeResponse, PublicKeyCredential,
    PublicKeyCredentialCreationOptions, RegisterPublicKeyCredential, RequestChallengeResponse,
};

pub fn window() -> Window {
    web_sys::window().expect("Unable to retrieve window")
}

#[derive(Debug, Clone)]
pub struct BrowserBackend;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl Backend for BrowserBackend {}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send), )]
impl WebauthnBackend for BrowserBackend {
    async fn get_assertion(
        &self,
        options: PublicKeyCredentialRequestOptions,
    ) -> Result<PublicKeyCredential, DeviceError> {
        let (tx, rx) = oneshot::channel();
        spawn_local(async move {
            let credentials = window().navigator().credentials();
            let promise = credentials
                .get_with_options(
                    &RequestChallengeResponse {
                        public_key: options,
                        mediation: None,
                    }
                    .into(),
                )
                .unwrap_throw();

            match JsFuture::from(promise).await {
                Ok(jsval) => {
                    let result =
                        PublicKeyCredential::from(web_sys::PublicKeyCredential::from(jsval));

                    let value = to_value(&result.response.client_data_json).unwrap_throw();
                    console::debug_1(&format!("client_data_json: {:#?}", value).into());
                    let _ = tx.send(Ok(result));
                }
                Err(e) => {
                    let _ = tx.send(Err(DeviceError::GetAssertion(format!("{:?}", e))));
                }
            }
        });

        rx.await.unwrap_or(Err(DeviceError::Channel(
            "get_assertion receiver dropped".to_string(),
        )))
    }

    async fn create_credential(
        options: PublicKeyCredentialCreationOptions,
    ) -> Result<RegisterPublicKeyCredential, DeviceError> {
        let (tx, rx) = oneshot::channel();

        spawn_local(async move {
            let promise = window()
                .navigator()
                .credentials()
                .create_with_options(
                    &CreationChallengeResponse {
                        public_key: options,
                    }
                    .into(),
                )
                .unwrap_throw();

            match JsFuture::from(promise).await {
                Ok(jsval) => {
                    let result = RegisterPublicKeyCredential::from(
                        web_sys::PublicKeyCredential::from(jsval),
                    );

                    let value = to_value(result.response.client_data_json.clone()).unwrap_throw();
                    console::debug_1(&format!("client_data_json:{:#?}", value).into());

                    let _ = tx.send(Ok(result));
                }
                Err(_e) => {
                    let _ = tx.send(Err(DeviceError::CreateCredential("".to_string())));
                }
            }
        });

        rx.await.unwrap_or(Err(DeviceError::Channel(
            "credential receiver dropped".to_string(),
        )))
    }
}

#[cfg(target_arch = "wasm32")]
impl OriginProvider for BrowserBackend {
    fn origin() -> Result<String, DeviceError> {
        let origin = window()
            .location()
            .origin()
            .map_err(|_| DeviceError::Origin("Unable to get origin".to_string()))?;
        Ok(origin)
    }
}

#[cfg(not(target_arch = "wasm32"))]
impl OriginProvider for BrowserBackend {
    fn origin() -> Result<String, DeviceError> {
        Ok("http://localhost:3001".to_string())
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait)]
impl StorageBackend for BrowserBackend {
    fn set(&mut self, key: &str, value: &StorageValue) -> Result<(), StorageError> {
        let local_storage = Self::local_storage()?;

        let serialized = serde_json::to_string(value)?;
        local_storage
            .set_item(key, &serialized)
            .map_err(|_| StorageError::OperationFailed("setting item in localStorage".into()))?;
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<StorageValue>, StorageError> {
        let local_storage = Self::local_storage()?;

        if let Ok(Some(value)) = local_storage.get_item(key) {
            let deserialized = serde_json::from_str(&value)?;
            Ok(Some(deserialized))
        } else {
            Ok(None)
        }
    }

    fn remove(&mut self, key: &str) -> Result<(), StorageError> {
        let local_storage = Self::local_storage()?;

        local_storage
            .remove_item(key)
            .map_err(|_| StorageError::OperationFailed("removing item from localStorage".into()))?;
        Ok(())
    }

    fn clear(&mut self) -> Result<(), StorageError> {
        let local_storage = Self::local_storage()?;

        local_storage
            .clear()
            .map_err(|_| StorageError::OperationFailed("clearing localStorage".into()))?;
        Ok(())
    }

    fn keys(&self) -> Result<Vec<String>, StorageError> {
        let local_storage = Self::local_storage()?;
        let length = local_storage
            .length()
            .map_err(|_| StorageError::OperationFailed("getting localStorage length".into()))?;
        let mut keys = Vec::new();
        for i in 0..length {
            if let Ok(Some(key)) = local_storage.key(i) {
                keys.push(key);
            }
        }
        Ok(keys)
    }
}

impl BrowserBackend {
    fn local_storage() -> Result<web_sys::Storage, StorageError> {
        window()
            .local_storage()
            .map_err(|_| StorageError::OperationFailed("Failed to get localStorage".into()))?
            .ok_or_else(|| StorageError::OperationFailed("localStorage not available".into()))
    }
}
