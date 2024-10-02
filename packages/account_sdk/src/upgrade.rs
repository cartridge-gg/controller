use starknet::core::types::Call;
use starknet_crypto::Felt;

use crate::{controller::Controller, provider::CartridgeProvider, Backend};

#[cfg(test)]
#[path = "upgrade_test.rs"]
mod upgrade_test;

impl<P, B> Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    pub fn upgrade(&self, new_class_hash: Felt) -> Call {
        self.contract().upgrade_getcall(&new_class_hash.into())
    }
}
