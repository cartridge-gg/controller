use async_trait::async_trait;

use account_sdk::signers::{webauthn::WebauthnOperations, DeviceError};
use futures::channel::oneshot;
use wasm_bindgen::UnwrapThrowExt;
use wasm_bindgen_futures::{spawn_local, JsFuture};
use web_sys::Window;
use webauthn_rs_proto::*;

pub fn window() -> Window {
    web_sys::window().expect("Unable to retrieve window")
}

#[derive(Debug, Clone)]
pub struct BrowserOperations {}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl WebauthnOperations for BrowserOperations {
    async fn get_assertion(
        &self,
        options: PublicKeyCredentialRequestOptions,
    ) -> Result<PublicKeyCredential, DeviceError> {
        let (tx, rx) = oneshot::channel();

        spawn_local(async move {
            let promise = window()
                .navigator()
                .credentials()
                .get_with_options(
                    &RequestChallengeResponse {
                        public_key: options,
                        mediation: Some(Mediation::Conditional),
                    }
                    .into(),
                )
                .unwrap_throw();

            match JsFuture::from(promise).await {
                Ok(jsval) => {
                    let _ = tx.send(Ok(PublicKeyCredential::from(
                        web_sys::PublicKeyCredential::from(jsval),
                    )));
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
                    let _ = tx.send(Ok(RegisterPublicKeyCredential::from(
                        web_sys::PublicKeyCredential::from(jsval),
                    )));
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
