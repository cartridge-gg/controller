// This file is auto-generated. Do not modify manually.
use lazy_static::lazy_static;
use starknet::macros::felt;
use starknet_types_core::felt::Felt;
use std::collections::HashMap;

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum Version {
    V1_0_4,
    V1_0_5,
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
                content: include_str!("../artifacts/controller.latest.contract_class.json"),
                hash: felt!("0x43d007f915efcfa95b63f7b2ca5c919e154b846485230be9f9bcb2a8f909db0"),
                casm_hash: felt!(
                    "0x27ced742d563292212eb18dc0f565aa54b60f6bf7749d16c41e8ecf439147bf"
                ),
            },
        );
        m.insert(
            Version::V1_0_5,
            ContractClass {
                content: include_str!("../artifacts/controller.v1.0.5.contract_class.json"),
                hash: felt!("0x32e17891b6cc89e0c3595a3df7cee760b5993744dc8dfef2bd4d443e65c0f40"),
                casm_hash: felt!(
                    "0x46b6264bd23cdea881b1b1110d7e1e5408507fa847f053ca9b272f4cbe1d55c"
                ),
            },
        );
        m.insert(
            Version::V1_0_4,
            ContractClass {
                content: include_str!("../artifacts/controller.v1.0.4.contract_class.json"),
                hash: felt!("0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab"),
                casm_hash: felt!(
                    "0x6b22de13b878ab346fa53442adaa8a40a6bd25732aa1aeb2a26375987f0be00"
                ),
            },
        );
        m
    };
    pub static ref DEFAULT_CONTROLLER: &'static ContractClass =
        CONTROLLERS.get(&Version::V1_0_5).unwrap();
    pub static ref VERSIONS: Vec<Version> = vec![Version::V1_0_4, Version::V1_0_5, Version::LATEST];
}
