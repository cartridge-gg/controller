use starknet::{core::types::FieldElement, macros::felt};

pub mod account;
pub mod cairo_args;
pub mod credential;
pub mod signers;

pub type U256 = (FieldElement, FieldElement);
pub type Secp256r1Point = (U256, U256);

// "Webauthn v1"
pub const WEBAUTHN_SIGNATURE_TYPE: FieldElement = felt!("0x576562617574686e207631");
