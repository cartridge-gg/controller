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
        // let challenge = challenge.to_vec();

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

            let result = JsFuture::from(promise).await;

            match result {
                Ok(jsval) => {
                    let w_rpkc = web_sys::PublicKeyCredential::from(jsval);
                    // Serialise the web_sys::pkc into the webauthn proto version, ready to
                    // handle/transmit.
                    let pkc = PublicKeyCredential::from(w_rpkc);
                    let _ = tx.send(Ok(pkc));
                }
                Err(e) => {
                    let _ = tx.send(Err(DeviceError::GetAssertion(format!("{:?}", e))));
                }
            }
        });

        match rx.await {
            Ok(result) => result,
            Err(_) => Err(DeviceError::Channel(
                "assertion receiver dropped".to_string(),
            )),
        }
    }

    async fn create_credential(
        options: PublicKeyCredentialCreationOptions,
    ) -> Result<RegisterPublicKeyCredential, DeviceError> {
        let (tx, rx) = oneshot::channel();

        spawn_local(async move {
            // Create a promise that calls the browsers navigator.credentials.create api.
            let promise = window()
                .navigator()
                .credentials()
                .create_with_options(
                    &CreationChallengeResponse {
                        public_key: options,
                    }
                    .into(),
                )
                .expect_throw("Unable to create promise");
            let fut: JsFuture = JsFuture::from(promise);

            match fut.await {
                Ok(jsval) => {
                    // Convert from the raw js value into the expected PublicKeyCredential
                    let w_rpkc = web_sys::PublicKeyCredential::from(jsval);
                    let rpkc = RegisterPublicKeyCredential::from(w_rpkc);
                    let _ = tx.send(Ok(rpkc));
                }
                Err(_e) => {
                    let _ = tx.send(Err(DeviceError::CreateCredential("".to_string())));
                }
            }
        });

        match rx.await {
            Ok(result) => result,
            Err(_) => Err(DeviceError::Channel(
                "credential receiver dropped".to_string(),
            )),
        }
    }
}
