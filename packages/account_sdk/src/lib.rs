use signers::DeviceError;

pub mod abigen;
pub mod account;
pub mod constants;
pub mod controller;
pub mod factory;
pub mod hash;
mod paymaster;
pub mod provider;
pub mod signers;
pub mod storage;
mod transaction_waiter;
pub mod typed_data;

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
pub mod tests;

#[cfg(test)]
pub mod controller_test;

#[cfg(test)]
pub mod paymaster_test;

pub trait OriginProvider {
    fn origin() -> Result<String, DeviceError>;
}
