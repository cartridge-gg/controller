// This file is auto-generated. Do not modify manually.
use lazy_static::lazy_static;
use starknet::macros::felt;
use starknet_types_core::felt::Felt;
use std::collections::HashMap;

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum Version {
    V1_0_4,
    V1_0_5,
    V1_0_6,
    LATEST,
}

#[derive(Clone, Copy)]
pub struct ContractClass {
    pub content: &'static str,
    pub hash: Felt,
    pub casm_hash: Felt,
}

unsafe impl Sync for ContractClass {}

lazy_static! {
    pub static ref CONTROLLERS: HashMap<Version, ContractClass> = {
        let mut m = HashMap::new();
        m.insert(
            Version::LATEST,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.latest.contract_class.json"),
                hash: felt!("0x4342bf7fbad4f200167e9b00b3c904df99a3836ceb280c58107da96a9099f86"),
                casm_hash: felt!(
                    "0x6b2bb9738c29372da692b244624d37ecb8ad218b70475ebb711a39e037afdc5"
                ),
            },
        );
        m.insert(
            Version::V1_0_6,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.v1.0.6.contract_class.json"),
                hash: felt!("0x59e4405accdf565112fe5bf9058b51ab0b0e63665d280b816f9fe4119554b77"),
                casm_hash: felt!(
                    "0x7ec32f8e2fa07937a81215894f48a3c9af93dc47c88ac6d6852b3fd39f7a6af"
                ),
            },
        );
        m.insert(
            Version::V1_0_5,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.v1.0.5.contract_class.json"),
                hash: felt!("0x32e17891b6cc89e0c3595a3df7cee760b5993744dc8dfef2bd4d443e65c0f40"),
                casm_hash: felt!(
                    "0x46b6264bd23cdea881b1b1110d7e1e5408507fa847f053ca9b272f4cbe1d55c"
                ),
            },
        );
        m.insert(
            Version::V1_0_4,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.v1.0.4.contract_class.json"),
                hash: felt!("0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab"),
                casm_hash: felt!(
                    "0x6b22de13b878ab346fa53442adaa8a40a6bd25732aa1aeb2a26375987f0be00"
                ),
            },
        );
        m
    };
    pub static ref DEFAULT_CONTROLLER: &'static ContractClass =
        CONTROLLERS.get(&Version::V1_0_6).unwrap();
    pub static ref VERSIONS: Vec<Version> = vec![
        Version::V1_0_4,
        Version::V1_0_5,
        Version::V1_0_6,
        Version::LATEST
    ];
}
