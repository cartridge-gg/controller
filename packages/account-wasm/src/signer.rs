use async_trait::async_trait;

use account_sdk::signers::{webauthn::WebauthnOperations, DeviceError};
use base64urlsafedata::Base64UrlSafeData;
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
        rp_id: String,
        credential_id: account_sdk::signers::webauthn::CredentialID,
        challenge: &[u8],
    ) -> Result<PublicKeyCredential, DeviceError> {
        let (tx, rx) = oneshot::channel();
        let challenge = challenge.to_vec();

        spawn_local(async move {
            let options = RequestChallengeResponse {
                public_key: PublicKeyCredentialRequestOptions {
                    challenge: Base64UrlSafeData::from(challenge),
                    timeout: Some(500),
                    rp_id,
                    allow_credentials: vec![AllowCredentials {
                        type_: "public-key".to_string(),
                        id: Base64UrlSafeData::from(credential_id),
                        transports: None,
                    }],
                    user_verification: UserVerificationPolicy::Required,
                    hints: None,
                    extensions: None,
                },
                mediation: Some(Mediation::Conditional),
            };

            let promise = window()
                .navigator()
                .credentials()
                .get_with_options(&options.into())
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
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<RegisterPublicKeyCredential, DeviceError> {
        let (tx, rx) = oneshot::channel();
        let challenge = challenge.to_vec();

        spawn_local(async move {
            // Create a promise that calls the browsers navigator.credentials.create api.
            let promise = window()
                .navigator()
                .credentials()
                .create_with_options(
                    &CreationChallengeResponse {
                        public_key: PublicKeyCredentialCreationOptions {
                            rp: RelyingParty {
                                name: "Cartridge".to_string(),
                                id: rp_id,
                            },
                            user: User {
                                id: Base64UrlSafeData::from(vec![0]),
                                name: user_name.clone(),
                                display_name: "".to_string(),
                            },
                            challenge: Base64UrlSafeData::from(challenge),
                            pub_key_cred_params: vec![PubKeyCredParams {
                                type_: "public-key".to_string(),
                                alg: -7,
                            }],
                            timeout: Some(500),
                            attestation: Some(AttestationConveyancePreference::Direct),
                            exclude_credentials: None,
                            authenticator_selection: Some(AuthenticatorSelectionCriteria {
                                user_verification: UserVerificationPolicy::Required,
                                ..AuthenticatorSelectionCriteria::default()
                            }),
                            extensions: None,
                            hints: None,
                            attestation_formats: None,
                        },
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
