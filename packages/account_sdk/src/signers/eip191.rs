use async_trait::async_trait;
use starknet::core::types::{EthAddress, Felt};

#[cfg(not(target_arch = "wasm32"))]
use alloy_primitives::eip191_hash_message;
#[cfg(not(target_arch = "wasm32"))]
use alloy_signer::k256::ecdsa::SigningKey;
#[cfg(not(target_arch = "wasm32"))]
use alloy_signer::utils::secret_key_to_address;
#[cfg(not(target_arch = "wasm32"))]
use rand::rngs::OsRng;

use crate::abigen::controller::SignerSignature;
#[cfg(not(target_arch = "wasm32"))]
use crate::abigen::controller::{
    Eip191Signer as ControllerEip191Signer, Signature as ControllerSignature,
};
use crate::signers::{HashSigner, SignError};

#[cfg(target_arch = "wasm32")]
use crate::abigen::controller::{
    Eip191Signer as ControllerEip191Signer, Signature as ControllerSignature,
};
#[cfg(target_arch = "wasm32")]
use crate::signers::external::external_sign_message;
#[cfg(target_arch = "wasm32")]
use cainome::cairo_serde::{EthAddress as CairoEthAddress, U256};
#[cfg(target_arch = "wasm32")]
use hex;

/// A signer that implements EIP-191 signing using the Alloy library
#[derive(Debug, Clone, PartialEq)]
pub struct Eip191Signer {
    #[cfg(not(target_arch = "wasm32"))]
    signing_key: SigningKey,
    address: EthAddress,
}

impl Eip191Signer {
    #[cfg(not(target_arch = "wasm32"))]
    /// Create a random Eip191Signer
    pub fn random() -> Self {
        let signing_key = SigningKey::random(&mut OsRng);
        let address = secret_key_to_address(&signing_key).0 .0.into();

        Self {
            signing_key,
            address,
        }
    }

    /// Get the Ethereum address of this signer
    pub fn address(&self) -> EthAddress {
        self.address.clone()
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[async_trait]
impl HashSigner for Eip191Signer {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        // Convert Felt to bytes
        let tx_hash_bytes = tx_hash.to_bytes_be();
        let message_hash = eip191_hash_message(tx_hash_bytes);

        // Sign the message hash using the k256 library
        // This returns a recoverable signature
        let recoverable_signature = self
            .signing_key
            .sign_prehash_recoverable(message_hash.as_slice())
            .map_err(|e| SignError::InvalidMessageError(e.to_string()))?;

        // Extract the signature components
        let (signature, recovery_id) = recoverable_signature;

        // If signature is normalized (s value changed), we need to flip the y_parity
        let (signature, y_parity) = if let Some(normalized) = signature.normalize_s() {
            (normalized, !recovery_id.is_y_odd())
        } else {
            (signature, recovery_id.is_y_odd())
        };

        // Get r and s values from the signature
        let r_bytes = signature.r().to_bytes();
        let s_bytes = signature.s().to_bytes();

        // Convert to the format expected by the controller
        let mut r_padded = [0u8; 32];
        r_padded[32 - r_bytes.len()..].copy_from_slice(&r_bytes);
        let mut s_padded = [0u8; 32];
        s_padded[32 - s_bytes.len()..].copy_from_slice(&s_bytes);

        let r = cainome::cairo_serde::U256::from_bytes_be(&r_padded);
        let s = cainome::cairo_serde::U256::from_bytes_be(&s_padded);

        // Create the Eip191Signer for the controller
        let eth_address = cainome::cairo_serde::EthAddress(self.address().into());
        let controller_signer = ControllerEip191Signer { eth_address };

        // Create the signature with the correct y_parity
        let signature = ControllerSignature { r, s, y_parity };

        Ok(SignerSignature::Eip191((controller_signer, signature)))
    }
}

#[cfg(target_arch = "wasm32")]
#[async_trait(?Send)]
impl HashSigner for Eip191Signer {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        // Format address and hash for the bridge
        let address_hex = format!("{:#x}", self.address);
        // Convert Felt to bytes, then to hex string. Assume bridge/wallet handles EIP-191 hashing.
        let message_hex = hex::encode(tx_hash.to_bytes_be());

        // Call the external signing function via the bridge
        let signature_hex = external_sign_message(&address_hex, &message_hex).await?;

        // Parse the combined hex signature (r, s, v)
        let signature_bytes = hex::decode(signature_hex.trim_start_matches("0x")).map_err(|e| {
            SignError::InvalidSignature(format!("Failed to decode signature hex: {}", e))
        })?;

        if signature_bytes.len() != 65 {
            return Err(SignError::InvalidSignature(format!(
                "Invalid signature length: expected 65, got {}",
                signature_bytes.len()
            )));
        }

        let r_bytes = &signature_bytes[0..32];
        let s_bytes = &signature_bytes[32..64];
        let v_byte = signature_bytes[64];

        // Convert r and s to U256
        let r = U256::from_bytes_be(r_bytes);
        let s = U256::from_bytes_be(s_bytes);

        // Calculate y_parity from v (normalize 27/28 or 0/1 to bool)
        // Starknet expects y_parity: 0 or 1. Ethereum uses v: 27 or 28.
        // y_parity is true if v is odd (1 or 27)
        let y_parity = v_byte % 2 != 0;

        // Create the controller structs
        let controller_signer = ControllerEip191Signer {
            eth_address: CairoEthAddress(self.address.into()),
        };
        let signature = ControllerSignature { r, s, y_parity };

        Ok(SignerSignature::Eip191((controller_signer, signature)))
    }
}

impl From<Eip191Signer> for crate::signers::Signer {
    fn from(signer: Eip191Signer) -> Self {
        crate::signers::Signer::Eip191(signer)
    }
}
