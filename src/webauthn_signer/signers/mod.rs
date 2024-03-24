use super::account::SignError;
use super::credential::AuthenticatorAssertionResponse;
use async_trait::async_trait;

pub mod device;
pub mod p256r1;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait Signer {
    async fn sign(&self, challenge: &[u8]) -> Result<AuthenticatorAssertionResponse, SignError>;
}
