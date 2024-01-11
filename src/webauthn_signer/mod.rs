use p256::{
    ecdsa::{signature::Signer, Signature, SigningKey, VerifyingKey},
    elliptic_curve::sec1::Coordinates,
};
use rand_core::OsRng;
use starknet::{core::types::FieldElement, macros::felt};

use crate::webauthn_signer::credential::{AuthenticatorData, CliendData};

use self::credential::AuthenticatorAssertionResponse;

pub mod account;
pub mod cairo_args;
pub mod credential;

pub type U256 = (FieldElement, FieldElement);
pub type Secp256r1Point = (U256, U256);

// "Webauthn v1"
pub const WEBAUTHN_SIGNATURE_TYPE: FieldElement = felt!("0x576562617574686e207631");

#[derive(Debug, Clone)]
pub struct P256r1Signer {
    pub signing_key: SigningKey,
    rp_id: String,
}

impl P256r1Signer {
    pub fn random(rp_id: String) -> Self {
        let signing_key = SigningKey::random(&mut OsRng);
        Self::new(signing_key, rp_id)
    }
    pub fn new(signing_key: SigningKey, rp_id: String) -> Self {
        Self { signing_key, rp_id }
    }
    pub fn public_key_bytes(&self) -> ([u8; 32], [u8; 32]) {
        let verifying_key: VerifyingKey = VerifyingKey::from(&self.signing_key);
        let encoded = &verifying_key.to_encoded_point(false);
        let (x, y) = match encoded.coordinates() {
            Coordinates::Uncompressed { x, y } => (x, y),
            _ => panic!("unexpected compression"),
        };
        (
            x.as_slice().try_into().unwrap(),
            y.as_slice().try_into().unwrap(),
        )
    }
    pub fn sign(&self, challenge: &[u8]) -> AuthenticatorAssertionResponse {
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

        AuthenticatorAssertionResponse {
            authenticator_data,
            client_data_json,
            signature,
            user_handle: None,
        }
    }
}

#[test]
fn test_signer() {
    let rp_id = "https://localhost:8080".to_string();
    let signer = P256r1Signer::random(rp_id);
    let calldata = signer.sign("842903840923".as_bytes());
    dbg!(&calldata);
}
