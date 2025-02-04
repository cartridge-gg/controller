use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::types::{FeeEstimate, PriceUnit};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use super::JsFelt;

#[derive(Tsify, Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum JsPriceUnit {
    #[serde(rename = "WEI")]
    Wei,
    #[serde(rename = "FRI")]
    Fri,
}

#[allow(non_snake_case)]
#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsEstimateFeeDetails {
    pub nonce: JsFelt,
}

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsFeeEstimate {
    pub gas_consumed: JsFelt,
    pub gas_price: JsFelt,
    pub overall_fee: JsFelt,
    pub unit: JsPriceUnit,
    pub data_gas_consumed: JsFelt,
    pub data_gas_price: JsFelt,
}

impl TryFrom<JsFeeEstimate> for FeeEstimate {
    type Error = super::EncodingError;

    fn try_from(estimate: JsFeeEstimate) -> Result<Self, Self::Error> {
        Ok(Self {
            gas_consumed: estimate.gas_consumed.try_into()?,
            gas_price: estimate.gas_price.try_into()?,
            overall_fee: estimate.overall_fee.try_into()?,
            data_gas_consumed: estimate.data_gas_consumed.try_into()?,
            data_gas_price: estimate.data_gas_price.try_into()?,
            unit: estimate.unit.into(),
        })
    }
}

impl From<FeeEstimate> for JsFeeEstimate {
    fn from(estimate: FeeEstimate) -> Self {
        Self {
            gas_consumed: estimate.gas_consumed.into(),
            gas_price: estimate.gas_price.into(),
            overall_fee: estimate.overall_fee.into(),
            data_gas_consumed: estimate.data_gas_consumed.into(),
            data_gas_price: estimate.data_gas_price.into(),
            unit: estimate.unit.into(),
        }
    }
}

impl From<JsPriceUnit> for PriceUnit {
    fn from(unit: JsPriceUnit) -> Self {
        match unit {
            JsPriceUnit::Wei => Self::Wei,
            JsPriceUnit::Fri => Self::Fri,
        }
    }
}

impl From<PriceUnit> for JsPriceUnit {
    fn from(unit: PriceUnit) -> Self {
        match unit {
            PriceUnit::Wei => Self::Wei,
            PriceUnit::Fri => Self::Fri,
        }
    }
}
