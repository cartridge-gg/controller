use cainome::cairo_serde::U256;

pub mod account;
pub mod credential;
pub mod json_helper;
pub mod signers;

pub type Secp256r1Point = (U256, U256);
