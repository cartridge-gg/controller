use cainome::cairo_serde::NonZero;
use starknet::signers::SigningKey;
use starknet_crypto::FieldElement;

use crate::abigen::cartridge_account::{
    Signer, SignerSignature, StarknetSignature, StarknetSigner,
};

use super::{HashSigner, SignError};

use async_trait::async_trait;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl HashSigner for SigningKey {
    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, SignError> {
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
    fn signer(&self) -> Signer {
        Signer::Starknet(StarknetSigner {
            pubkey: NonZero::new(self.verifying_key().scalar()).unwrap(),
        })
    }
}
