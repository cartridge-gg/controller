use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;

#[serde_as]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsDeployment {
    #[serde_as(as = "UfeHex")]
    pub address: Felt,

    #[serde_as(as = "Vec<UfeHex>")]
    pub calldata: Vec<Felt>,
}
