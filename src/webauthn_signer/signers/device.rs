use async_trait::async_trait;
use cainome::cairo_serde::{NonZero, U256};
use ecdsa::{RecoveryId, VerifyingKey};
use futures::channel::oneshot;
use p256::NistP256;
use std::result::Result;
use wasm_bindgen_futures::spawn_local;
use wasm_webauthn::*;

use crate::{
    abigen::cartridge_account::{Signature, WebauthnSigner},
    webauthn_signer::{
        account::SignError,
        credential::{AuthenticatorAssertionResponse, AuthenticatorData},
    },
};

use super::Signer;

#[derive(Debug, thiserror::Error)]
pub enum DeviceError {
    #[error("Create credential error: {0}")]
    CreateCredential(String),
    #[error("Get assertion error: {0}")]
    GetAssertion(String),
    #[error("Bad assertion error: {0}")]
    BadAssertion(String),
    #[error("Channel error: {0}")]
    Channel(String),
}

#[derive(Debug, Clone)]
pub struct DeviceSigner {
    pub rp_id: String,
    pub credential_id: Vec<u8>,
    pub origin: String,
}

impl DeviceSigner {
    pub fn new(rp_id: String, credential_id: Vec<u8>, origin: String) -> Self {
        Self {
            rp_id,
            credential_id,
            origin,
        }
    }

    pub async fn register(
        rp_id: String,
        origin: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<Self, SignError> {
        let MakeCredentialResponse { credential } =
            Self::create_credential(rp_id.clone(), user_name, challenge).await?;

        Ok(Self {
            rp_id,
            credential_id: credential.id.0,
            origin,
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
    pub fn rp_id_hash(&self) -> [u8; 32] {
        use sha2::{digest::Update, Digest, Sha256};
        Sha256::new().chain(self.rp_id.clone()).finalize().into()
    }
    pub fn pub_key_bytes(&self) -> [u8; 64] {
        todo!()
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
        let r = U256::from_bytes_be(ecdsa_sig.r().to_bytes().as_slice().try_into().unwrap());
        let s = U256::from_bytes_be(ecdsa_sig.s().to_bytes().as_slice().try_into().unwrap());

        let recovery_id = RecoveryId::trial_recovery_from_msg(
            &VerifyingKey::from_sec1_bytes(&self.pub_key_bytes()).map_err(|_| {
                SignError::Device(DeviceError::BadAssertion("Invalid public key".to_string()))
            })?,
            challenge,
            &ecdsa_sig,
        )
        .map_err(|_| {
            SignError::Device(DeviceError::BadAssertion(
                "Unable to recover id".to_string(),
            ))
        })?;

        let signature = Signature {
            r,
            s,
            y_parity: recovery_id.is_y_odd(),
        };

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
    fn account_signer(&self) -> WebauthnSigner {
        WebauthnSigner {
            rp_id_hash: NonZero(U256::from_bytes_be(&self.rp_id_hash())),
            origin: self.origin.clone().into_bytes(),
            pubkey: NonZero(U256::from_bytes_be(
                &self.pub_key_bytes()[0..32].try_into().unwrap(),
            )),
        }
    }
}
