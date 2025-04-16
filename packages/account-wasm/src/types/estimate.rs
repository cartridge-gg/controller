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
    pub l1_gas_consumed: JsFelt,
    pub l1_gas_price: JsFelt,
    pub l2_gas_consumed: JsFelt,
    pub l2_gas_price: JsFelt,
    pub overall_fee: JsFelt,
    pub unit: JsPriceUnit,
    pub l1_data_gas_consumed: JsFelt,
    pub l1_data_gas_price: JsFelt,
}

impl TryFrom<JsFeeEstimate> for FeeEstimate {
    type Error = super::EncodingError;

    fn try_from(estimate: JsFeeEstimate) -> Result<Self, Self::Error> {
        Ok(Self {
            l1_gas_consumed: estimate.l1_gas_consumed.try_into()?,
            l1_gas_price: estimate.l1_gas_price.try_into()?,
            l2_gas_consumed: estimate.l2_gas_consumed.try_into()?,
            l2_gas_price: estimate.l2_gas_price.try_into()?,
            overall_fee: estimate.overall_fee.try_into()?,
            l1_data_gas_consumed: estimate.l1_data_gas_consumed.try_into()?,
            l1_data_gas_price: estimate.l1_data_gas_price.try_into()?,
            unit: estimate.unit.into(),
        })
    }
}

impl From<FeeEstimate> for JsFeeEstimate {
    fn from(estimate: FeeEstimate) -> Self {
        Self {
            l1_gas_consumed: estimate.l1_gas_consumed.into(),
            l1_gas_price: estimate.l1_gas_price.into(),
            l2_gas_consumed: estimate.l2_gas_consumed.into(),
            l2_gas_price: estimate.l2_gas_price.into(),
            overall_fee: estimate.overall_fee.into(),
            l1_data_gas_consumed: estimate.l1_data_gas_consumed.into(),
            l1_data_gas_price: estimate.l1_data_gas_price.into(),
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

#[cfg(test)]
mod tests {
    use super::*;
    use starknet::core::types::PriceUnit;
    use starknet_crypto::Felt;

    #[test]
    fn test_fee_estimate_conversion() {
        // Create a JsFeeEstimate that matches the JS structure
        let js_estimate = JsFeeEstimate {
            l1_gas_consumed: Felt::ZERO.into(),
            l1_gas_price: Felt::ZERO.into(),
            l2_gas_consumed: Felt::ZERO.into(),
            l2_gas_price: Felt::ZERO.into(),
            overall_fee: Felt::ZERO.into(),
            unit: JsPriceUnit::Fri,
            l1_data_gas_consumed: Felt::ZERO.into(),
            l1_data_gas_price: Felt::ZERO.into(),
        };

        // Test conversion to FeeEstimate
        let fee_estimate: FeeEstimate =
            js_estimate.try_into().expect("Should convert successfully");

        assert_eq!(fee_estimate.l1_gas_consumed, Felt::ZERO);
        assert_eq!(fee_estimate.l1_gas_price, Felt::ZERO);
        assert_eq!(fee_estimate.l2_gas_consumed, Felt::ZERO);
        assert_eq!(fee_estimate.l2_gas_price, Felt::ZERO);
        assert_eq!(fee_estimate.overall_fee, Felt::ZERO);
        assert_eq!(fee_estimate.unit, PriceUnit::Fri);
        assert_eq!(fee_estimate.l1_data_gas_consumed, Felt::ZERO);
        assert_eq!(fee_estimate.l1_data_gas_price, Felt::ZERO);

        // Test conversion back to JsFeeEstimate
        let converted_back: JsFeeEstimate = fee_estimate.into();

        assert_eq!(converted_back.l1_gas_consumed.0, Felt::ZERO);
        assert_eq!(converted_back.l1_gas_price.0, Felt::ZERO);
        assert_eq!(converted_back.l2_gas_consumed.0, Felt::ZERO);
        assert_eq!(converted_back.l2_gas_price.0, Felt::ZERO);
        assert_eq!(converted_back.overall_fee.0, Felt::ZERO);
        assert_eq!(converted_back.unit, JsPriceUnit::Fri);
        assert_eq!(converted_back.l1_data_gas_consumed.0, Felt::ZERO);
        assert_eq!(converted_back.l1_data_gas_price.0, Felt::ZERO);
    }

    #[test]
    fn test_price_unit_conversion() {
        assert_eq!(PriceUnit::from(JsPriceUnit::Wei), PriceUnit::Wei);
        assert_eq!(PriceUnit::from(JsPriceUnit::Fri), PriceUnit::Fri);

        assert_eq!(JsPriceUnit::from(PriceUnit::Wei), JsPriceUnit::Wei);
        assert_eq!(JsPriceUnit::from(PriceUnit::Fri), JsPriceUnit::Fri);
    }
}
