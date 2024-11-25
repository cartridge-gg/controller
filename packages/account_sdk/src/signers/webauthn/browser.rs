use async_trait::async_trait;
use futures::channel::oneshot;
use serde_json::to_value;
use wasm_bindgen::UnwrapThrowExt;
use wasm_bindgen_futures::{spawn_local, JsFuture};
use web_sys::{console, Window};
use webauthn_rs_proto::{
    auth::PublicKeyCredentialRequestOptions, CreationChallengeResponse, PublicKeyCredential,
    PublicKeyCredentialCreationOptions, RegisterPublicKeyCredential, RequestChallengeResponse, UserVerificationPolicy,
};

use crate::signers::{webauthn::WebauthnOperations, DeviceError};

pub fn window() -> Window {
    web_sys::window().expect("Unable to retrieve window")
}

#[derive(Debug, Clone)]
pub struct BrowserOperations;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send), )]
impl WebauthnOperations for BrowserOperations {
    // async fn detect_resident_keys(&self) -> Result<Option<PublicKeyCredential>, DeviceError> {
    //     let (tx, rx) = oneshot::channel();
    //     spawn_local(async move {
    //         let credentials = window().navigator().credentials();

    //         // Create minimal options for conditional UI
    //         let options = RequestChallengeResponse {
    //             public_key: PublicKeyCredentialRequestOptions {
    //                 challenge: Base64UrlSafeData(vec![0u8; 32]), // dummy challenge
    //                 timeout: Some(60000),
    //                 rp_id: window().location().hostname().unwrap_throw(),
    //                 allow_credentials: vec![], // empty to allow any credential
    //                 user_verification: UserVerificationPolicy::Required,
    //                 hints: None,
    //                 extensions: None
    //             },
    //             mediation: Some("conditional".to_string()),
    //         };

    //         let promise = credentials.get_with_options(&options.into()).unwrap_throw();

    //         match JsFuture::from(promise).await {
    //             Ok(jsval) => {
    //                 let result =
    //                     PublicKeyCredential::from(web_sys::PublicKeyCredential::from(jsval));
    //                 let _ = tx.send(Ok(Some(result)));
    //             }
    //             Err(_) => {
    //                 let _ = tx.send(Ok(None)); // No resident key found or user cancelled
    //             }
    //         }
    //     });

    //     rx.await.unwrap_or(Err(DeviceError::Channel(
    //         "detect_resident_keys receiver dropped".to_string(),
    //     )))
    // }

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
        &self,
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

    fn origin(&self) -> Result<String, DeviceError> {
        let origin = window()
            .location()
            .origin()
            .map_err(|_| DeviceError::Origin("Unable to get origin".to_string()))?;
        Ok(origin)
    }
}
