use crate::abigen::{
    self,
    controller::{Sha256Implementation, Signer, SignerSignature, WebauthnSignature},
};
use async_trait::async_trait;
use cainome::cairo_serde::{NonZero, U256};
use coset::{cbor::Value, iana, CoseKey, KeyType, Label};
use ecdsa::{RecoveryId, VerifyingKey};
use p256::NistP256;
use sha2::{digest::Update, Digest, Sha256};
use starknet::core::types::Felt;
use std::result::Result;

use super::{DeviceError, HashSigner, SignError};
use crate::abigen::controller::Signature;

pub type Secp256r1Point = (U256, U256);

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientData {
    #[serde(rename = "type")]
    pub(super) type_: String,
    pub(super) challenge: String,
    pub(super) origin: String,
    #[serde(rename = "crossOrigin")]
    pub(super) cross_origin: bool,
}

impl ClientData {
    pub fn new(challenge: impl AsRef<[u8]>, origin: String) -> Self {
        use base64::{engine::general_purpose::URL_SAFE, Engine as _};
        let challenge = URL_SAFE.encode(challenge);

        Self {
            type_: "webauthn.get".into(),
            challenge,
            origin,
            cross_origin: false,
        }
    }
    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap()
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AuthenticatorData {
    pub rp_id_hash: [u8; 32],
    pub flags: u8,
    pub sign_count: u32,
}

impl From<AuthenticatorData> for Vec<u8> {
    fn from(value: AuthenticatorData) -> Self {
        let mut data = Vec::new();
        data.extend_from_slice(&value.rp_id_hash);
        data.push(value.flags);
        data.extend_from_slice(&value.sign_count.to_be_bytes());
        data
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CredentialID(pub Vec<u8>);

#[derive(Debug, Clone)]
pub struct Credential {
    pub id: CredentialID,
    pub public_key: Option<CoseKey>,
}

#[derive(Debug, Clone)]
pub struct CreateCredentialResponse {
    pub credential: Credential,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GetAssertionResponse {
    pub signature: Vec<u8>,
    pub rp_id_hash: [u8; 32],
    pub client_data_json: String,
    pub flags: u8,
    pub counter: u32,
    pub authenticator_data: Vec<u8>,
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait WebauthnOperations {
    async fn get_assertion(
        &self,
        rp_id: String,
        credential_id: CredentialID,
        challenge: &[u8],
    ) -> Result<GetAssertionResponse, DeviceError>;

    async fn create_credential(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<CreateCredentialResponse, DeviceError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> HashSigner for WebauthnSigner<T>
where
    T: WebauthnOperations + Sync + Into<abigen::controller::WebauthnSigner>,
{
    // According to https://www.w3.org/TR/webauthn/#clientdatajson-verification
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        let mut challenge = tx_hash.to_bytes_be().to_vec();

        challenge.push(Sha256Implementation::Cairo1.encode());
        let GetAssertionResponse {
            rp_id_hash: _,
            signature,
            client_data_json,
            authenticator_data,
            flags,
            counter,
        } = self
            .device
            .get_assertion(self.rp_id.clone(), self.credential_id.clone(), &challenge)
            .await
            .map_err(SignError::Device)?;

        let client_data_hash = Sha256::new().chain(client_data_json.clone()).finalize();
        let mut message = Into::<Vec<u8>>::into(authenticator_data);
        message.append(&mut client_data_hash.to_vec());

        let ecdsa_sig = ecdsa::Signature::<NistP256>::from_der(&signature).unwrap();
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

        let mut signature = Signature {
            r,
            s,
            y_parity: recovery_id.is_y_odd(),
        };

        use p256::{
            elliptic_curve::{
                bigint::{Encoding, Uint},
                scalar::FromUintUnchecked,
            },
            Scalar,
        };
        use std::ops::Neg;
        let s = signature.s;
        let s_scalar = Scalar::from_uint_unchecked(Uint::from_be_bytes(s.to_bytes_be()));
        let s_neg = U256::from_bytes_be(s_scalar.neg().to_bytes().as_slice().try_into().unwrap());
        if s > s_neg {
            signature.s = s_neg;
            signature.y_parity = !signature.y_parity;
        }

        let webauthn_signature = WebauthnSignature {
            flags: flags,
            cross_origin: false, // assertion.client_data().cross_origin, serde_json::from_str(&self.client_data_json).unwrap()
            sign_count: counter,
            ec_signature: signature,
            sha256_implementation: Sha256Implementation::Cairo1,
            client_data_json_outro: vec![], //TODO: it can theoretically be non-empty
        };

        Ok(SignerSignature::Webauthn((
            abigen::controller::WebauthnSigner::from(self),
            webauthn_signature,
        )))
    }

    fn signer(&self) -> Signer {
        Signer::Webauthn(abigen::controller::WebauthnSigner::from(self))
    }
}

trait Sha256ImplementationEncoder {
    fn encode(&self) -> u8;
}

impl Sha256ImplementationEncoder for Sha256Implementation {
    fn encode(&self) -> u8 {
        match self {
            Sha256Implementation::Cairo0 => 0,
            Sha256Implementation::Cairo1 => 1,
        }
    }
}

#[derive(Debug, Clone)]
pub struct WebauthnSigner<T: WebauthnOperations> {
    pub rp_id: String,
    pub origin: String,
    pub credential_id: CredentialID,
    pub pub_key: CoseKey,
    pub device: T,
}

impl<T: WebauthnOperations> From<&WebauthnSigner<T>> for abigen::controller::WebauthnSigner {
    fn from(signer: &WebauthnSigner<T>) -> Self {
        Self {
            rp_id_hash: NonZero::new(U256::from_bytes_be(&signer.rp_id_hash())).unwrap(),
            origin: signer.origin.clone().into_bytes(),
            pubkey: NonZero::new(U256::from_bytes_be(
                &signer.pub_key_bytes().unwrap()[0..32].try_into().unwrap(),
            ))
            .unwrap(),
        }
    }
}

impl<T: WebauthnOperations> WebauthnSigner<T> {
    pub fn new(
        rp_id: String,
        origin: String,
        credential_id: CredentialID,
        pub_key: CoseKey,
        device: T,
    ) -> Self {
        Self {
            rp_id,
            origin,
            credential_id,
            pub_key,
            device,
        }
    }

    pub async fn register(
        rp_id: String,
        origin: String,
        user_name: String,
        challenge: &[u8],
        device: T,
    ) -> Result<Self, DeviceError> {
        let res = T::create_credential(rp_id.clone(), user_name.clone(), challenge).await?;

        let pub_key = res
            .credential
            .public_key
            .ok_or(DeviceError::CreateCredential("No public key".to_string()))?;

        Ok(Self {
            rp_id,
            credential_id: res.credential.id,
            pub_key,
            origin,
            device,
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

    pub fn rp_id_hash(&self) -> [u8; 32] {
        use sha2::{digest::Update, Digest, Sha256};
        Sha256::new().chain(self.rp_id.clone()).finalize().into()
    }

    pub fn pub_key_bytes(&self) -> Result<[u8; 64], DeviceError> {
        Self::extract_pub_key(&self.pub_key)
    }
}
