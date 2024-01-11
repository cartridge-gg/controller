use serde::Serialize;
use starknet::core::types::FieldElement;

use crate::abigen::account::U256 as AbiU256;

use super::{credential::AuthenticatorAssertionResponse, U256};

// Note: The conversion is done here to avoid modifying the whole
// codebase for now.
// `unwrap()` is supposed to be safe here and the FieldElement value is
// only use for serialiaziation.
impl From<U256> for AbiU256 {
    fn from(value: U256) -> Self {
        Self {
            low: value.0.try_into().unwrap(),
            high: value.1.try_into().unwrap(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct VerifyWebauthnSignerArgs {
    pub r: U256,
    pub s: U256,
    pub type_offset: u32,
    pub challenge_offset: u32,
    pub origin_offset: u32,
    pub client_data_json: Vec<u8>,
    pub challenge: Vec<u8>,
    pub origin: Vec<u8>,
    pub authenticator_data: Vec<u8>,
}

pub fn pub_key_to_felts(pub_key: ([u8; 32], [u8; 32])) -> (U256, U256) {
    let (pub_x, pub_y) = (felt_pair(&pub_key.0), felt_pair(&pub_key.1));
    (pub_x, pub_y)
}

impl VerifyWebauthnSignerArgs {
    pub fn from_response(
        origin: String,
        challenge: Vec<u8>,
        response: AuthenticatorAssertionResponse,
    ) -> Self {
        let (r, s) = (
            felt_pair(&response.signature[0..32].try_into().unwrap()),
            felt_pair(&response.signature[32..64].try_into().unwrap()),
        );
        let type_offset = find_value_index(&response.client_data_json, "type").unwrap();
        let challenge_offset = find_value_index(&response.client_data_json, "challenge").unwrap();
        let origin_offset = find_value_index(&response.client_data_json, "origin").unwrap();
        Self {
            r,
            s,
            type_offset: type_offset as u32,
            challenge_offset: challenge_offset as u32,
            origin_offset: origin_offset as u32,
            client_data_json: response.client_data_json.into_bytes(),
            challenge,
            origin: origin.into_bytes(),
            authenticator_data: response.authenticator_data.into(),
        }
    }
}

fn felt_pair(bytes: &[u8; 32]) -> (FieldElement, FieldElement) {
    (
        FieldElement::from_bytes_be(&extend_to_32(&bytes[16..32])).unwrap(),
        FieldElement::from_bytes_be(&extend_to_32(&bytes[0..16])).unwrap(),
    )
}

fn extend_to_32(bytes: &[u8]) -> [u8; 32] {
    let mut ret = [0; 32];
    ret[32 - bytes.len()..].copy_from_slice(bytes);
    ret
}

fn find_value_index(json_str: &str, key: &str) -> Option<usize> {
    let key_index = json_str.find(&format!("\"{}\"", key))?;

    let colon_index = json_str[key_index..].find(':')? + key_index;

    let value_start_index = json_str[colon_index + 1..].find('"')?;

    Some(colon_index + 1 + value_start_index + 1)
}

#[cfg(test)]
mod tests {
    use super::find_value_index;
    #[test]
    fn test_find_value_index() {
        let json_str =
            r#"{"type":"webauthn.get","challenge":"aGVsbG8=","origin":"https://example.com"}"#;
        assert_eq!(find_value_index(json_str, "type"), Some(9));
        assert_eq!(find_value_index(json_str, "challenge"), Some(36));
        assert_eq!(find_value_index(json_str, "origin"), Some(56));
    }

    #[test]
    fn test_find_value_index_whitespace() {
        let json_str = r#"{   "type":      "webauthn.get",  "challenge":   "aGVsbG8=","origin":    "https://example.com"}"#;
        assert_eq!(find_value_index(json_str, "type"), Some(18));
        assert_eq!(find_value_index(json_str, "challenge"), Some(50));
        assert_eq!(find_value_index(json_str, "origin"), Some(74));
    }
}
