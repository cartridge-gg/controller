use starknet::core::types::Call;
use starknet_crypto::Felt;

use crate::controller::Controller;

#[cfg(all(test, not(target_arch = "wasm32")))]
#[path = "upgrade_test.rs"]
mod upgrade_test;

impl Controller {
    pub fn upgrade(&self, new_class_hash: Felt) -> Call {
        self.contract().upgrade_getcall(&new_class_hash.into())
    }
}
