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
    use crate::types::policy::CallPolicy;
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
