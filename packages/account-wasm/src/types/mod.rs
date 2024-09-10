use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::{serde::unsigned_field_element::UfeHex, utils::NonAsciiNameError};
use starknet_types_core::felt::{Felt, FromStrError};
use tsify_next::Tsify;

pub(crate) mod call;
pub(crate) mod estimate;
pub(crate) mod invocation;
pub(crate) mod outside_execution;
pub(crate) mod policy;
pub(crate) mod session;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsFelt(#[serde_as(as = "UfeHex")] pub Felt);

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
