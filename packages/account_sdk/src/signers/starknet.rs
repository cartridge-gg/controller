use cainome::cairo_serde::NonZero;
use starknet::signers::SigningKey;
use starknet::{core::types::Felt, macros::short_string};
use starknet_crypto::poseidon_hash;

use crate::abigen::controller::{SignerSignature, StarknetSignature, StarknetSigner};

use super::{HashSigner, SignError};

use async_trait::async_trait;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl HashSigner for SigningKey {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        let signature = self.sign(tx_hash).map_err(SignError::Signer)?;
        let pubkey = NonZero::new(self.verifying_key().scalar()).unwrap();
        Ok(SignerSignature::Starknet((
            StarknetSigner { pubkey },
            StarknetSignature {
                r: signature.r,
                s: signature.s,
            },
        )))
    }
}

impl From<StarknetSigner> for Felt {
    fn from(signer: StarknetSigner) -> Self {
        poseidon_hash(short_string!("Starknet Signer"), *signer.pubkey.inner())
    }
}
