pub mod deploy_contract;
mod transaction_waiter;
pub mod webauthn_signer;

pub mod abigen;
pub mod felt_ser;
pub mod session_token;

#[cfg(test)]
pub mod tests;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}
