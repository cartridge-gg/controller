use signers::DeviceError;
use storage::StorageBackend;

pub mod abigen;
pub mod account;
pub mod artifacts;
pub mod constants;
pub mod controller;
pub mod errors;
pub mod factory;
pub mod hash;
pub mod paymaster;
pub mod provider;
pub mod session;
pub mod signers;
pub mod storage;
mod transaction_waiter;
pub mod typed_data;
pub mod utils;

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
pub mod tests;

pub trait Backend: StorageBackend + OriginProvider {}

pub trait OriginProvider: std::fmt::Debug {
    fn origin(&self) -> Result<String, DeviceError>;
}
