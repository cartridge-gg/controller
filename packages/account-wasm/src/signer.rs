use async_trait::async_trait;

use account_sdk::signers::{
    webauthn::{
        CreateCredentialResponse, Credential, CredentialID, GetAssertionResponse,
        WebauthnOperations,
    },
    DeviceError,
};
use futures::channel::oneshot;
use wasm_bindgen_futures::spawn_local;
use wasm_webauthn::{GetAssertionArgsBuilder, MakeCredentialArgsBuilder};
use web_sys::UserVerificationRequirement;

#[derive(Debug, Clone)]
pub struct BrowserOperations {}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl WebauthnOperations for BrowserOperations {
    async fn get_assertion(
        &self,
        rp_id: String,
        credential_id: CredentialID,
        challenge: &[u8],
    ) -> Result<GetAssertionResponse, DeviceError> {
        let (tx, rx) = oneshot::channel();
        let challenge = challenge.to_vec();

        spawn_local(async move {
            let credential = wasm_webauthn::Credential {
                id: wasm_webauthn::CredentialID(credential_id.0),
                public_key: None,
            };
            let result = GetAssertionArgsBuilder::default()
                .rp_id(Some(rp_id))
                .credentials(Some(vec![credential]))
                .challenge(challenge)
                .uv(UserVerificationRequirement::Required)
                .build()
                .expect("invalid args")
                .get_assertion()
                .await;

            match result {
                Ok(assertion) => {
                    let _ = tx.send(Ok(assertion));
                }
                Err(e) => {
                    let _ = tx.send(Err(DeviceError::GetAssertion(e.to_string())));
                }
            }
        });

        match rx.await {
            Ok(result) => result.map(|wasm_response: wasm_webauthn::GetAssertionResponse| {
                GetAssertionResponse {
                    rp_id_hash: wasm_response.rp_id_hash,
                    client_data_json: wasm_response.client_data_json,
                    authenticator_data: wasm_response.authenticator_data,
                    signature: wasm_response.signature,
                    flags: wasm_response.flags,
                    counter: wasm_response.counter,
                }
            }),
            Err(_) => Err(DeviceError::Channel(
                "assertion receiver dropped".to_string(),
            )),
        }
    }

    async fn create_credential(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<CreateCredentialResponse, DeviceError> {
        let (tx, rx) = oneshot::channel();
        let challenge = challenge.to_vec();

        spawn_local(async move {
            let result = MakeCredentialArgsBuilder::default()
                .rp_id(Some(rp_id))
                .challenge(challenge)
                .user_name(Some(user_name))
                .uv(UserVerificationRequirement::Required)
                .build()
                .expect("invalid args")
                .make_credential()
                .await;

            match result {
                Ok(credential) => {
                    let _ = tx.send(Ok(CreateCredentialResponse {
                        credential: Credential {
                            id: CredentialID(credential.credential.id.0),
                            public_key: credential.credential.public_key,
                        },
                    }));
                }
                Err(e) => {
                    let _ = tx.send(Err(DeviceError::CreateCredential(e.to_string())));
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
