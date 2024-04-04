use async_trait::async_trait;
use futures::channel::oneshot;
use p256::NistP256;
use std::result::Result;
use wasm_bindgen_futures::spawn_local;
use wasm_webauthn::*;

use crate::webauthn_signer::{
    account::SignError,
    credential::{AuthenticatorAssertionResponse, AuthenticatorData},
};

use super::Signer;

#[derive(Debug, thiserror::Error)]
pub enum DeviceError {
    #[error("Create credential error: {0}")]
    CreateCredential(String),
    #[error("Get assertion error: {0}")]
    GetAssertion(String),
    #[error("Channel error: {0}")]
    Channel(String),
}

#[derive(Debug, Clone)]
pub struct DeviceSigner {
    pub rp_id: String,
    pub credential_id: Vec<u8>,
}

impl DeviceSigner {
    pub fn new(rp_id: String, credential_id: Vec<u8>) -> Self {
        Self {
            rp_id,
            credential_id,
        }
    }

    pub async fn register(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<Self, SignError> {
        let MakeCredentialResponse { credential } =
            Self::create_credential(rp_id.clone(), user_name, challenge).await?;

        Ok(Self {
            rp_id,
            credential_id: credential.id.0,
        })
    }

    async fn create_credential(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<MakeCredentialResponse, SignError> {
        let (tx, rx) = oneshot::channel();
        let rp_id = rp_id.to_owned();
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
                    let _ = tx.send(Ok(credential));
                }
                Err(e) => {
                    let _ = tx.send(Err(DeviceError::CreateCredential(e.to_string())));
                }
            }
        });

        match rx.await {
            Ok(result) => result.map_err(SignError::Device),
            Err(_) => Err(SignError::Device(DeviceError::Channel(
                "credential receiver dropped".to_string(),
            ))),
        }
    }

    async fn get_assertion(&self, challenge: &[u8]) -> Result<GetAssertionResponse, SignError> {
        let (tx, rx) = oneshot::channel();
        let credential_id = self.credential_id.clone();
        let rp_id = self.rp_id.to_owned();
        let challenge = challenge.to_vec();

        spawn_local(async move {
            let credential = Credential::from(CredentialID(credential_id));

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
            Ok(result) => result.map_err(SignError::Device),
            Err(_) => Err(SignError::Device(DeviceError::Channel(
                "assertion receiver dropped".to_string(),
            ))),
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl Signer for DeviceSigner {
    async fn sign(&self, challenge: &[u8]) -> Result<AuthenticatorAssertionResponse, SignError> {
        let GetAssertionResponse {
            signature: encoded_sig,
            rp_id_hash,
            client_data_json,
            flags,
            counter,
        } = self.get_assertion(challenge).await?;

        let ecdsa_sig = ecdsa::Signature::<NistP256>::from_der(&encoded_sig).unwrap();
        let r = ecdsa_sig.r().to_bytes(); 
        let s = ecdsa_sig.s().to_bytes();

        let mut signature = r.as_slice().to_vec();
        signature.extend_from_slice(s.as_slice());

        Ok(AuthenticatorAssertionResponse {
            authenticator_data: AuthenticatorData {
                rp_id_hash,
                flags,
                sign_count: counter,
            },
            client_data_json,
            signature,
            user_handle: None,
        })
    }
}
