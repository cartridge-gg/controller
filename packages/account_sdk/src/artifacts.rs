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
    V1_0_7,
    V1_0_8,
    V1_0_9,
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
                hash: felt!("0x35fe40d30fd6937d972492ed09f9f409973fa61b3cc2fe821c3ebb517c1c44d"),
                casm_hash: felt!(
                    "0x462d4f81293ffa97dc725e28179dfa8e7160b4b92f00c8dc2acd248bcd9cc01"
                ),
            },
        );
        m.insert(
            Version::V1_0_7,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.v1.0.7.contract_class.json"),
                hash: felt!("0x3e0a04bab386eaa51a41abe93d8035dccc96bd9d216d44201266fe0b8ea1115"),
                casm_hash: felt!(
                    "0x60eda0e15a5a5962b4866793e86a074ce22490debf9449fb62d12f28a534c78"
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
        m.insert(
            Version::V1_0_9,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.v1.0.9.contract_class.json"),
                hash: felt!("0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf"),
                casm_hash: felt!(
                    "0x2fcd4b347622fd2dbe973ad873666f8925b3f244120793014248b4fd9670bd9"
                ),
            },
        );
        m.insert(
            Version::V1_0_8,
            ContractClass {
                content: include_str!("../artifacts/classes/controller.v1.0.8.contract_class.json"),
                hash: felt!("0x511dd75da368f5311134dee2356356ac4da1538d2ad18aa66d57c47e3757d59"),
                casm_hash: felt!(
                    "0x2f2386cd9bea7724f79d8c392b6b99228721d1e8769b1b482287520dfc4d3eb"
                ),
            },
        );
        m
    };
    pub static ref DEFAULT_CONTROLLER: &'static ContractClass =
        CONTROLLERS.get(&Version::V1_0_9).unwrap();
    pub static ref VERSIONS: Vec<Version> = vec![
        Version::V1_0_4,
        Version::V1_0_5,
        Version::V1_0_6,
        Version::V1_0_7,
        Version::V1_0_8,
        Version::V1_0_9,
        Version::LATEST
    ];
}
