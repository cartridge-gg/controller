use serde::{Deserialize, Serialize};
use starknet_types_core::felt::Felt;
use wasm_bindgen::JsError;
use web_sys::window;

use crate::types::policy::Policy;

type Result<T> = std::result::Result<T, JsError>;

#[derive(Serialize, Deserialize)]
pub struct StoredPolicies {
    policies: Vec<Policy>,
}

pub struct PolicyStorage {
    storage_key: String,
}

impl PolicyStorage {
    pub fn new(address: &Felt, app_id: &str, chain_id: &Felt) -> Self {
        let storage_key = format!(
            "@cartridge/policies/0x{:x}/{}/0x{:x}",
            address,
            urlencoding::encode(app_id),
            chain_id
        );
        Self { storage_key }
    }

    pub fn store(&self, policies: Vec<Policy>) -> Result<()> {
        if let Some(window) = window() {
            if let Ok(Some(storage)) = window.local_storage() {
                let stored = StoredPolicies { policies };
                if let Ok(json) = serde_json::to_string(&stored) {
                    storage
                        .set_item(&self.storage_key, &json)
                        .map_err(|_| JsError::new("Failed to store policies"))?;
                }
            }
        }
        Ok(())
    }

    pub fn get(&self) -> Result<Option<StoredPolicies>> {
        if let Some(window) = window() {
            if let Ok(Some(storage)) = window.local_storage() {
                if let Ok(Some(json)) = storage.get_item(&self.storage_key) {
                    return Ok(serde_json::from_str(&json).ok());
                }
            }
        }
        Ok(None)
    }

    pub fn is_requested(&self, policies: &[Policy]) -> Result<bool> {
        Ok(self
            .get()?
            .map(|stored| check_is_requested(&stored.policies, policies))
            .unwrap_or(false))
    }

    pub fn is_authorized(&self, policies: &[Policy]) -> Result<bool> {
        Ok(self
            .get()?
            .map(|stored| check_is_authorized(&stored.policies, policies))
            .unwrap_or(false))
    }
}

fn check_policies<F>(stored_policies: &[Policy], policies: &[Policy], check_fn: F) -> bool
where
    F: Fn(&Policy, &Policy) -> bool,
{
    policies
        .iter()
        .all(|p| stored_policies.iter().any(|stored_p| check_fn(stored_p, p)))
}

fn check_is_requested(stored_policies: &[Policy], policies: &[Policy]) -> bool {
    check_policies(stored_policies, policies, |stored, requested| {
        stored.is_requested(requested)
    })
}

fn check_is_authorized(stored_policies: &[Policy], policies: &[Policy]) -> bool {
    check_policies(stored_policies, policies, |stored, requested| {
        match (stored, requested) {
            (Policy::Call(stored_call), Policy::Call(requested_call)) => {
                // Target and method must match
                stored_call.target == requested_call.target &&
                stored_call.method == requested_call.method &&
                // The stored policy must explicitly authorize (Some(true))
                stored_call.authorized == Some(true)
                // Ignore the requested policy's authorized field
            }
            (Policy::TypedData(stored_td), Policy::TypedData(requested_td)) => {
                stored_td.scope_hash == requested_td.scope_hash
                    && stored_td.authorized == Some(true)
                // Ignore the requested policy's authorized field
            }
            _ => false,
        }
    })
}

#[cfg(test)]
mod policy_check_tests {
    use crate::types::policy::{CallPolicy, TypedDataPolicy};
    use crate::types::JsFelt;
    use starknet::{
        core::types::{Call, Felt},
        macros::felt,
    };
    use std::str::FromStr;

    use super::*;

    #[test]
    fn test_check_is_requested() {
        let policy1 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: None,
        });
        let policy2 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: Some(true),
        });
        let policy3 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x9999")),
            method: JsFelt(felt!("0x5678")),
            authorized: None,
        });

        let stored = vec![policy1.clone()];

        // Test exact match
        assert!(check_is_requested(&stored, &[policy1.clone()]));

        // Test authorized policy matches non-authorized request
        assert!(check_is_requested(&stored, &[policy2]));

        // Test non-matching policy
        assert!(!check_is_requested(&stored, &[policy3]));

        // Test multiple policies - should now pass since we allow duplicates
        assert!(check_is_requested(
            &stored,
            &[policy1.clone(), policy1.clone()]
        ));

        // Test duplicate requested policies with multiple stored - should pass
        let stored_multiple = vec![policy1.clone(), policy1.clone()];
        assert!(check_is_requested(
            &stored_multiple,
            &[policy1.clone(), policy1.clone()]
        ));
    }

    #[test]
    fn test_check_is_authorized() {
        let policy1 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: Some(true),
        });
        let policy2 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: None,
        });
        let policy3 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x9999")),
            method: JsFelt(felt!("0x5678")),
            authorized: Some(true),
        });

        let stored = vec![policy1.clone()];

        // Test exact match
        assert!(check_is_authorized(&stored, &[policy1.clone()]));

        // Test unauthorized policy doesn't match authorized
        assert!(check_is_authorized(&stored, &[policy2]));

        // Test non-matching policy
        assert!(!check_is_authorized(&stored, &[policy3]));

        // Test multiple policies
        assert!(check_is_authorized(
            &stored,
            &[policy1.clone(), policy1.clone()]
        ));

        // Test duplicate authorized policies - this should pass after our fix
        let stored_multiple = vec![policy1.clone(), policy1.clone()];
        assert!(check_is_authorized(
            &stored_multiple,
            &[policy1.clone(), policy1.clone()]
        ));
    }

    #[test]
    fn test_check_is_authorized_from_call() {
        // Create a policy and store it
        let stored_policy = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: Some(true),
        });

        let stored = vec![stored_policy];

        // Create a Call that matches the stored policy
        let call = Call {
            to: Felt::from_str("0x1234").unwrap(),
            selector: Felt::from_str("0x5678").unwrap(),
            calldata: vec![],
        };

        // Create Policy from Call
        let policy_from_call = Policy::from_call(&call);

        // Test that the policy created from Call is authorized
        assert!(check_is_authorized(&stored, &[policy_from_call]));

        // Create a Call that doesn't match the stored policy
        let non_matching_call = Call {
            to: Felt::from_str("0x9999").unwrap(),
            selector: Felt::from_str("0x5678").unwrap(),
            calldata: vec![],
        };

        // Create Policy from Call
        let non_matching_policy = Policy::from_call(&non_matching_call);

        // Test that the policy created from non-matching Call is not authorized
        assert!(!check_is_authorized(&stored, &[non_matching_policy]));
    }

    #[test]
    fn test_check_is_requested_repro() {
        let stored_policies: StoredPolicies = serde_json::from_value(serde_json::json!({
            "policies": [
                {
                    "target": "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9",
                    "method": "0x03e3206846c6af283e7cc32535cedc907baa136cabe6e16b99293a5f2cc4c779",
                    "authorized": true
                },
                {
                    "target": "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9",
                    "method": "0x0288e0008b7fa613946f762581bef0c72122c2783566b66733fcaac3a343aaa2",
                    "authorized": true
                },
                {
                    "target": "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9",
                    "method": "0x0289a7f6b881efee2716d96340d21bb015be817b4168a22bec667c012d15e3d8",
                    "authorized": true
                },
                {
                    "target": "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9",
                    "method": "0x01230f2b389bbf1393d72c54025de3fbe2d15da89dba1da28fc10f2d2736aaa6",
                    "authorized": true
                },
                {
                    "target": "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f",
                    "method": "0x01ec68d1d7dbfcae6df48fdb695f26c68db6c5efa4dbd8d895a55e571b0423ad",
                    "authorized": true
                },
                {
                    "target": "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f",
                    "method": "0x02de582fa8b711fd2f57fc168a6af91869489b862a010a1fafe445369007158d",
                    "authorized": true
                },
                {
                    "target": "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f",
                    "method": "0x03baff2a04cb4464b9195e3604d1d855aa80ceb2bcef4972679a1ca6fb7fce01",
                    "authorized": true
                },
                {
                    "target": "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f",
                    "method": "0x01dba2c96ccf742f3800b726f4ea062327c1553c984b5139c6a85be2c29d46a3",
                    "authorized": true
                },
                {
                    "target": "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9",
                    "method": "0x03491cd21465d81cd71cfe493d1f25a3e75010b8e5a977501b7d8be21c05f0d6",
                    "authorized": true
                },
                {
                    "target": "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9",
                    "method": "0x00c6a0de5d1564818f952de797305656d38babed74a2b5f644bb6976c7610641",
                    "authorized": true
                },
                {
                    "target": "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9",
                    "method": "0x01a54c395fa140984a9b0a773962386ef9665bf65bb9734960d63d151542c541",
                    "authorized": true
                },
                {
                    "target": "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9",
                    "method": "0x01f30275ab70dd1890c0789c4570632b6f0b0284d11c2d9e587d0368f7027018",
                    "authorized": true
                },
                {
                    "target": "0x02e9c711b1a7e2784570b1bda5082a92606044e836ba392d2b977d280fb74b3c",
                    "method": "0x019ea283db64e3a83e53c412d66546500dd977b94142973d0f80ac94b72c2715",
                    "authorized": true
                },
                {
                    "target": "0x02e9c711b1a7e2784570b1bda5082a92606044e836ba392d2b977d280fb74b3c",
                    "method": "0x01a22a89434dc797d2a046d637279d7ce9d103342577a47f4f601d5af8aeed1c",
                    "authorized": true
                },
                {
                    "target": "0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f",
                    "method": "0x0380d7871eeaf3ee2c177c082d5fbf08989da3b8ce22fa3938d225e48d757660",
                    "authorized": true
                },
                {
                    "target": "0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f",
                    "method": "0x03ac39951327ee0119f6df38e1d0c60d6aa39417505feebf6031d5fad95f918a",
                    "authorized": true
                },
                {
                    "target": "0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f",
                    "method": "0x000048fe78e79ebecbd877704f88298e32d69bda4f2513476d6375cfbbeb0d85",
                    "authorized": true
                },
                {
                    "target": "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f",
                    "method": "0x012a5a2e008479001f8f1a5f6c61ab6536d5ce46571fcdc0c9300dca0a9e532f",
                    "authorized": true
                },
                {
                    "scope_hash": "0x0649eea1a5c0f7a3e3d66b63b3738d31e528227e0c7d13c9003aae2fd5ba8723",
                    "authorized": true
                },
                {
                    "scope_hash": "0x0693820fcb2060cf1227fbc4a0445bc0dd2d4c4aac7591967e78d3a69a8f2fe0",
                    "authorized": true
                },
                {
                    "scope_hash": "0x06006848edd66a8a926df6eb19e4bb912c7fab3dae650f5d2b2d798c686310a6",
                    "authorized": true
                }
            ]
        })).unwrap();

        let requested_policies = vec![
            // Contracts
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("commit_moves").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("reveal_moves").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("collect_duel").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x02c6a7c98a9dea8322b51018eef7be99ebedd209cebdaacb9f4c5bbf661c1cc9"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("clear_call_to_action").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("sponsor_duelists").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("sponsor_season").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("sponsor_tournament").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("collect_season").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("claim_starter_pack").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("claim_gift").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9"
                )),
                method: JsFelt(starknet::core::utils::get_selector_from_name("purchase").unwrap()),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x071333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9"
                )),
                method: JsFelt(starknet::core::utils::get_selector_from_name("open").unwrap()),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x02e9c711b1a7e2784570b1bda5082a92606044e836ba392d2b977d280fb74b3c"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("create_duel").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x02e9c711b1a7e2784570b1bda5082a92606044e836ba392d2b977d280fb74b3c"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("reply_duel").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f"
                )),
                method: JsFelt(starknet::core::utils::get_selector_from_name("poke").unwrap()),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f"
                )),
                method: JsFelt(starknet::core::utils::get_selector_from_name("sacrifice").unwrap()),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("memorialize").unwrap(),
                ),
                authorized: None,
            }),
            Policy::Call(CallPolicy {
                target: JsFelt(felt!(
                    "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f"
                )),
                method: JsFelt(
                    starknet::core::utils::get_selector_from_name("request_random").unwrap(),
                ),
                authorized: None,
            }),
            // Messages - using scope_hash from stored_policies for simplicity in this test
            Policy::TypedData(TypedDataPolicy {
                scope_hash: JsFelt(felt!(
                    "0x0649eea1a5c0f7a3e3d66b63b3738d31e528227e0c7d13c9003aae2fd5ba8723"
                )),
                authorized: None,
            }),
            Policy::TypedData(TypedDataPolicy {
                scope_hash: JsFelt(felt!(
                    "0x0693820fcb2060cf1227fbc4a0445bc0dd2d4c4aac7591967e78d3a69a8f2fe0"
                )),
                authorized: None,
            }),
            Policy::TypedData(TypedDataPolicy {
                scope_hash: JsFelt(felt!(
                    "0x06006848edd66a8a926df6eb19e4bb912c7fab3dae650f5d2b2d798c686310a6"
                )),
                authorized: None,
            }),
        ];

        assert!(
            check_is_requested(&stored_policies.policies, &requested_policies),
            "check_is_requested should return true for the given policies"
        );
    }
}

#[cfg(all(test, target_arch = "wasm32"))]
mod tests {
    use super::*;
    use crate::types::{
        policy::{CallPolicy, TypedDataPolicy},
        JsFelt,
    };
    use starknet::{core::types::Felt, macros::felt};
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_policy_storage_is_requested() {
        let storage = PolicyStorage::new(&Felt::from(1), "test_app", &Felt::from(1));

        // Create some test policies
        let policy1 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: None,
        });
        let policy2 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: Some(true),
        });
        let policy3 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x9999")), // Different target
            method: JsFelt(felt!("0x5678")),
            authorized: None,
        });

        // Store some policies
        storage.store(vec![policy1.clone()]).unwrap();

        // Test exact match
        assert!(storage.is_requested(&[policy1.clone()]).unwrap());

        // Test authorized policy matches non-authorized request
        assert!(storage.is_requested(&[policy2.clone()]).unwrap());

        // Test non-matching policy
        assert!(!storage.is_requested(&[policy3]).unwrap());

        // Test multiple policies
        assert!(!storage
            .is_requested(&[policy1.clone(), policy2.clone()])
            .unwrap());
    }

    #[wasm_bindgen_test]
    fn test_policy_storage_is_authorized() {
        let storage = PolicyStorage::new(&Felt::from(1), "test_app", &Felt::from(1));

        // Create some test policies
        let policy1 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: Some(true),
        });
        let policy2 = Policy::Call(CallPolicy {
            target: JsFelt(felt!("0x1234")),
            method: JsFelt(felt!("0x5678")),
            authorized: None,
        });
        let policy3 = Policy::TypedData(TypedDataPolicy {
            scope_hash: JsFelt(felt!("0x1234")),
            authorized: Some(true),
        });

        // Store authorized policies
        storage
            .store(vec![policy1.clone(), policy3.clone()])
            .unwrap();

        // Test authorized policy
        assert!(storage.is_authorized(&[policy1.clone()]).unwrap());

        // Test unauthorized policy
        assert!(!storage.is_authorized(&[policy2]).unwrap());

        // Test different policy types
        assert!(storage.is_authorized(&[policy3.clone()]).unwrap());

        // Test multiple policies
        assert!(storage.is_authorized(&[policy1, policy3]).unwrap());
    }
}
