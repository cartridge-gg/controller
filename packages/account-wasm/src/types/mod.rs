use std::str::FromStr;

use account_sdk::execute_from_outside::FeeSource;
use serde::{Deserialize, Serialize};
use starknet::core::utils::NonAsciiNameError;
use starknet_types_core::felt::{Felt, FromStrError};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

pub(crate) mod call;
pub(crate) mod estimate;
pub(crate) mod owner;
pub(crate) mod policy;
pub(crate) mod session;
pub(crate) mod signer;

#[allow(non_snake_case)]
#[derive(Debug, Clone, PartialEq, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsFelt(pub Felt);

// Custom serialization for TypeScript compatibility
impl Serialize for JsFelt {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.0.to_fixed_hex_string().serialize(serializer)
    }
}

// Custom deserialization for TypeScript compatibility
impl<'de> Deserialize<'de> for JsFelt {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let string_repr = String::deserialize(deserializer)?;
        let felt = Felt::from_str(&string_repr)
            .map_err(|e| serde::de::Error::custom(format!("Invalid Felt: {}", e)))?;
        Ok(JsFelt(felt))
    }
}

impl JsFelt {
    // Get the inner Felt
    pub fn as_felt(&self) -> &Felt {
        &self.0
    }

    // Get the string representation
    pub fn as_str(&self) -> String {
        self.0.to_fixed_hex_string()
    }
}

impl TryFrom<JsFelt> for Felt {
    type Error = FromStrError;

    fn try_from(jsfelt: JsFelt) -> Result<Self, Self::Error> {
        Ok(jsfelt.0)
    }
}

impl From<Felt> for JsFelt {
    fn from(felt: Felt) -> Self {
        JsFelt(felt)
    }
}

impl From<&str> for JsFelt {
    fn from(s: &str) -> Self {
        let felt = Felt::from_str(s).unwrap_or_else(|_| Felt::from(0));
        JsFelt(felt)
    }
}

impl From<String> for JsFelt {
    fn from(s: String) -> Self {
        let felt = Felt::from_str(&s).unwrap_or_else(|_| Felt::from(0));
        JsFelt(felt)
    }
}

#[allow(non_snake_case)]
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

    #[error("Unexpected option: {0}")]
    UnexpectedOption(String),
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "UPPERCASE")]
pub enum JsFeeSource {
    Paymaster,
    Credits,
}

impl TryFrom<JsFeeSource> for FeeSource {
    type Error = FromStrError;

    fn try_from(value: JsFeeSource) -> Result<Self, Self::Error> {
        match value {
            JsFeeSource::Paymaster => Ok(FeeSource::Paymaster),
            JsFeeSource::Credits => Ok(FeeSource::Credits),
        }
    }
}

#[cfg(all(test, target_arch = "wasm32"))]
mod tests {
    use super::*;
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

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
        assert_eq!(expected_felt, deserialized.try_into().unwrap());

        // --- test with decimal string ---

        let dec_str = "1337";

        let jsstr = JsValue::from_str(dec_str);
        let deserialized: JsFelt = serde_wasm_bindgen::from_value(jsstr).unwrap();

        let expected_felt = Felt::from_str(dec_str).unwrap();
        assert_eq!(expected_felt, deserialized.try_into().unwrap());
    }
}
