use signers::DeviceError;

pub mod abigen;
pub mod account;
pub mod constants;
pub mod controller;
pub mod factory;
pub mod hash;
pub mod paymaster;
pub mod provider;
pub mod signers;
pub mod storage;
mod transaction_waiter;
pub mod typed_data;

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
pub mod tests;

pub trait OriginProvider: std::fmt::Debug {
    fn origin(&self) -> Result<String, DeviceError>;
}
