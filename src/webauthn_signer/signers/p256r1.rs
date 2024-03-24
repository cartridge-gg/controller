use crate::webauthn_signer::{
    account::SignError,
    credential::{AuthenticatorData, CliendData},
};
use async_trait::async_trait;
use p256::{
    ecdsa::{signature::Signer as P256Signer, Signature, SigningKey, VerifyingKey},
    elliptic_curve::sec1::Coordinates,
};
use rand_core::OsRng;

use crate::webauthn_signer::credential::AuthenticatorAssertionResponse;

use super::Signer;

#[derive(Debug, Clone)]
pub struct P256r1Signer {
    pub signing_key: SigningKey,
    rp_id: String,
}

impl P256r1Signer {
    pub fn new(rp_id: String, signing_key: SigningKey) -> Self {
        Self { rp_id, signing_key }
    }

    pub fn random(rp_id: String) -> Self {
        let signing_key = SigningKey::random(&mut OsRng);
        Self::new(rp_id, signing_key)
    }

    pub fn public_key_bytes(&self) -> ([u8; 32], [u8; 32]) {
        P256VerifyingKeyConverter::new(*self.signing_key.verifying_key()).to_bytes()
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl Signer for P256r1Signer {
    async fn sign(&self, challenge: &[u8]) -> Result<AuthenticatorAssertionResponse, SignError> {
        use sha2::{digest::Update, Digest, Sha256};

        let authenticator_data = AuthenticatorData {
            rp_id_hash: [0; 32],
            flags: 0b00000101,
            sign_count: 0,
        };
        let client_data_json = CliendData::new(challenge, self.rp_id.clone()).to_json();
        let client_data_hash = Sha256::new().chain(client_data_json.clone()).finalize();

        let mut to_sign = Into::<Vec<u8>>::into(authenticator_data.clone());
        to_sign.append(&mut client_data_hash.to_vec());
        let signature: Signature = self.signing_key.try_sign(&to_sign).unwrap();
        let signature = signature.to_bytes().to_vec();

        Ok(AuthenticatorAssertionResponse {
            authenticator_data,
            client_data_json,
            signature,
            user_handle: None,
        })
    }
}

pub struct P256VerifyingKeyConverter {
    pub verifying_key: VerifyingKey,
}

impl P256VerifyingKeyConverter {
    pub fn new(verifying_key: VerifyingKey) -> Self {
        Self { verifying_key }
    }
    pub fn to_bytes(&self) -> ([u8; 32], [u8; 32]) {
        let encoded = &self.verifying_key.to_encoded_point(false);
        let (x, y) = match encoded.coordinates() {
            Coordinates::Uncompressed { x, y } => (x, y),
            _ => panic!("unexpected compression"),
        };
        (
            x.as_slice().try_into().unwrap(),
            y.as_slice().try_into().unwrap(),
        )
    }
}
