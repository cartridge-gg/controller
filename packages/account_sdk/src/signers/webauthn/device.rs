use async_trait::async_trait;
use cainome::cairo_serde::{NonZero, U256};
use coset::{cbor::Value, iana, CoseKey, KeyType, Label};
use ecdsa::{RecoveryId, VerifyingKey};
use futures::channel::oneshot;
use p256::NistP256;
use sha2::{digest::Update, Digest, Sha256};
use std::result::Result;
use wasm_bindgen_futures::spawn_local;
use wasm_webauthn::*;

use crate::abigen::controller::{Signature, WebauthnSigner};

use super::{
    credential::{AuthenticatorAssertionResponse, AuthenticatorData},
    SignError, WebauthnAccountSigner,
};

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
    pub origin: String,
    pub credential_id: CredentialID,
    pub pub_key: CoseKey,
}

impl DeviceSigner {
    pub fn new(
        rp_id: String,
        origin: String,
        credential_id: CredentialID,
        pub_key: CoseKey,
    ) -> Self {
        Self {
            rp_id,
            origin,
            credential_id,
            pub_key,
        }
    }

    pub async fn register(
        rp_id: String,
        origin: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<Self, DeviceError> {
        let MakeCredentialResponse { credential } =
            Self::create_credential(rp_id.clone(), user_name, challenge).await?;

        let pub_key = credential
            .public_key
            .ok_or(DeviceError::CreateCredential("No public key".to_string()))?;

        Ok(Self {
            rp_id,
            credential_id: credential.id,
            pub_key,
            origin,
        })
    }

    fn extract_pub_key(cose_key: &CoseKey) -> Result<[u8; 64], DeviceError> {
        if cose_key.kty != KeyType::Assigned(iana::KeyType::EC2) {
            return Err(DeviceError::CreateCredential(
                "Invalid key type".to_string(),
            ));
        }

        let mut x_coord: Option<Vec<u8>> = None;
        let mut y_coord: Option<Vec<u8>> = None;

        for (label, value) in &cose_key.params {
            match label {
                Label::Int(-2) => {
                    if let Value::Bytes(vec) = value {
                        x_coord = Some(vec.clone());
                    }
                }
                Label::Int(-3) => {
                    if let Value::Bytes(vec) = value {
                        y_coord = Some(vec.clone());
                    }
                }
                _ => {}
            }
        }

        let x = x_coord.ok_or(DeviceError::CreateCredential("No x coord".to_string()))?;
        let y = y_coord.ok_or(DeviceError::CreateCredential("No y coord".to_string()))?;

        if x.len() != 32 || y.len() != 32 {
            return Err(DeviceError::CreateCredential(
                "Invalid key length".to_string(),
            ));
        }

        let mut pub_key = [0u8; 64];
        pub_key[..32].copy_from_slice(&x);
        pub_key[32..].copy_from_slice(&y);

        Ok(pub_key)
    }

    async fn create_credential(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<MakeCredentialResponse, DeviceError> {
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
            Ok(result) => result.map_err(|e| DeviceError::CreateCredential(e.to_string())),
            Err(_) => Err(DeviceError::Channel(
                "credential receiver dropped".to_string(),
            )),
        }
    }

    async fn get_assertion(&self, challenge: &[u8]) -> Result<GetAssertionResponse, SignError> {
        let (tx, rx) = oneshot::channel();
        let credential_id = self.credential_id.clone();
        let rp_id = self.rp_id.to_owned();
        let challenge = challenge.to_vec();

        spawn_local(async move {
            let credential = Credential::from(credential_id);

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
    pub fn pub_key_bytes(&self) -> Result<[u8; 64], DeviceError> {
        Self::extract_pub_key(&self.pub_key)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl WebauthnAccountSigner for DeviceSigner {
    async fn sign(&self, challenge: &[u8]) -> Result<AuthenticatorAssertionResponse, SignError> {
        let GetAssertionResponse {
            signature: encoded_sig,
            rp_id_hash,
            client_data_json,
            flags,
            counter,
            authenticator_data: raw_auth_data,
        } = self.get_assertion(challenge).await?;

        let client_data_hash = Sha256::new().chain(client_data_json.clone()).finalize();
        let mut message = Into::<Vec<u8>>::into(raw_auth_data);
        message.append(&mut client_data_hash.to_vec());

        let ecdsa_sig = ecdsa::Signature::<NistP256>::from_der(&encoded_sig).unwrap();
        let r = U256::from_bytes_be(ecdsa_sig.r().to_bytes().as_slice().try_into().unwrap());
        let s = U256::from_bytes_be(ecdsa_sig.s().to_bytes().as_slice().try_into().unwrap());

        let pub_key = self.pub_key_bytes().map_err(SignError::Device)?;
        let mut sec1_key = Vec::with_capacity(65);
        sec1_key.push(0x4); // prefix 0x04 for uncompressed SEC1 format
        sec1_key.extend_from_slice(&pub_key);

        let recovery_id = RecoveryId::trial_recovery_from_msg(
            &VerifyingKey::from_sec1_bytes(&sec1_key).map_err(|_| {
                SignError::Device(DeviceError::BadAssertion("Invalid public key".to_string()))
            })?,
            &message,
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
    fn signer_pub_data(&self) -> WebauthnSigner {
        WebauthnSigner {
            rp_id_hash: NonZero::new(U256::from_bytes_be(&self.rp_id_hash())).unwrap(),
            origin: self.origin.clone().into_bytes(),
            pubkey: NonZero::new(U256::from_bytes_be(
                &self.pub_key_bytes().unwrap()[0..32].try_into().unwrap(),
            ))
            .unwrap(),
        }
    }
}
