use serde::Serialize;
use starknet::core::types::FieldElement;

use crate::abigen::cartridge_account::U256 as AbiU256;

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
    pub y_parity: bool,
    pub type_offset: usize,
    pub challenge_offset: usize,
    pub challenge_length: usize,
    pub origin_offset: usize,
    pub origin_length: usize,
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
        let y_parity = response.signature[64] & 1 == 1;
        let (type_offset, _) = find_value_index_length(&response.client_data_json, "type").unwrap();
        let (challenge_offset, challenge_length) = find_value_index_length(&response.client_data_json, "challenge").unwrap();
        let (origin_offset, origin_length) = find_value_index_length(&response.client_data_json, "origin").unwrap();
        Self {
            r,
            s,
            y_parity,
            type_offset,
            challenge_offset,
            challenge_length,
            origin_offset,
            origin_length,
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

fn find_value_index_length(json_str: &str, key: &str) -> Option<(usize, usize)> {
    let key_index = json_str.find(&format!("\"{}\"", key))?;

    let colon_index = json_str[key_index..].find(':')? + key_index;

    let value_start_index = json_str[colon_index + 1..].find('"')?;

    let value_length = json_str[colon_index + 1 + value_start_index + 1..]
        .find('"')
        .unwrap();

    Some((colon_index + 1 + value_start_index + 1, value_length))
}

#[cfg(test)]
mod tests {
    use super::find_value_index_length;
    #[test]
    fn test_find_value_index() {
        let json_str =
            r#"{"type":"webauthn.get","challenge":"aGVsbG8=","origin":"https://example.com"}"#;
        assert_eq!(find_value_index_length(json_str, "type"), Some((9, 12)));
        assert_eq!(find_value_index_length(json_str, "challenge"), Some((36, 8)));
        assert_eq!(find_value_index_length(json_str, "origin"), Some((56, 19)));
    }

    #[test]
    fn test_find_value_index_whitespace() {
        let json_str = r#"{   "type":      "webauthn.get",  "challenge":   "aGVsbG8=","origin":    "https://example.com"}"#;
        assert_eq!(find_value_index_length(json_str, "type"), Some((18, 12)));
        assert_eq!(find_value_index_length(json_str, "challenge"), Some((50, 8)));
        assert_eq!(find_value_index_length(json_str, "origin"), Some((74, 19)));
    }
}
