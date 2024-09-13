use std::str::FromStr;

use serde::{Deserialize, Serialize};
use starknet::core::utils::NonAsciiNameError;
use starknet_types_core::felt::{Felt, FromStrError};
use tsify_next::Tsify;

pub(crate) mod call;
pub(crate) mod estimate;
pub(crate) mod invocation;
pub(crate) mod outside_execution;
pub(crate) mod policy;
pub(crate) mod session;

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsFelt(#[serde(deserialize_with = "deserialize_felt")] pub Felt);

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Felts(pub Vec<JsFelt>);

#[derive(thiserror::Error, Debug)]
pub enum EncodingError {
    #[error(transparent)]
    FromStr(#[from] FromStrError),

    #[error(transparent)]
    NonAsciiName(#[from] NonAsciiNameError),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_wasm_bindgen::Error),
}

// need this in order to be able to deserialize from BOTH decimal and hex (0x-prefixed) string.
// the default Deserialize implementation of Felt only supports deserializing from hex strings.
fn deserialize_felt<'de, D: serde::Deserializer<'de>>(deserializer: D) -> Result<Felt, D::Error> {
    let s = String::deserialize(deserializer)?;
    Felt::from_str(&s).map_err(serde::de::Error::custom)
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_jsfelt_serialization() {
        let hex_str = "0x1309e973a3ec4c86dd679a455317ffdaa64e1e86d39f0b420";

        let jsstr = JsValue::from_str(hex_str);
        let jsfelt: JsFelt = serde_wasm_bindgen::from_value(jsstr).unwrap();

        let str = serde_wasm_bindgen::to_value(&jsfelt).unwrap();
        assert_eq!(hex_str, str.as_string().unwrap(), "Serialize as hex string");
    }

    #[wasm_bindgen_test]
    fn test_jsfelt_deserialization() {
        // --- test with hex string ---

        let hex_str = "0x1309e973a3ec4c86dd679a455317ffdaa64e1e86d39f0b420";

        let jsstr = JsValue::from_str(hex_str);
        let deserialized: JsFelt = serde_wasm_bindgen::from_value(jsstr).unwrap();

        let expected_felt = Felt::from_str(hex_str).unwrap();
        assert_eq!(expected_felt, deserialized.0);

        // --- test with decimal string ---

        let dec_str = "1337";

        let jsstr = JsValue::from_str(dec_str);
        let deserialized: JsFelt = serde_wasm_bindgen::from_value(jsstr).unwrap();

        let expected_felt = Felt::from_str(dec_str).unwrap();
        assert_eq!(expected_felt, deserialized.0);
    }
}
