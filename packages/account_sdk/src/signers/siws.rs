use async_trait::async_trait;

use starknet::core::types::Felt;
use starknet::macros::short_string;
use starknet_crypto::PoseidonHasher;

#[cfg(not(target_arch = "wasm32"))]
use rand::rngs::OsRng;

#[cfg(not(target_arch = "wasm32"))]
use ed25519_dalek::{Signer as Ed25519Signer, SigningKey};

#[cfg(not(target_arch = "wasm32"))]
use crate::abigen::controller::{EdDSASignatureWithHint, SIWSSignature};

use crate::abigen::controller::{Ed25519Signer as ControllerEd25519Signer, SignerSignature};
use crate::signers::{HashSigner, SignError};

// #[cfg(not(target_arch = "wasm32"))]
// pub mod testing;

/// A signer that implements Sign In With Solana (SIWS) using Ed25519 signatures
#[derive(Debug, Clone, PartialEq)]
pub struct SIWSSigner {
    #[cfg(not(target_arch = "wasm32"))]
    keypair: SigningKey,
    pub pubkey: [u8; 32],
    pub domain: String,
}

impl SIWSSigner {
    #[cfg(not(target_arch = "wasm32"))]
    /// Create a random SIWS Signer with a default domain
    pub fn random() -> Self {
        Self::random_with_domain("https://cartridge.gg".to_string())
    }

    #[cfg(not(target_arch = "wasm32"))]
    /// Create a random SIWS Signer with a specified domain
    pub fn random_with_domain(domain: String) -> Self {
        let mut csprng = OsRng;
        let keypair: SigningKey = SigningKey::generate(&mut csprng);
        let pubkey = keypair.verifying_key().to_bytes();

        Self {
            keypair,
            pubkey,
            domain,
        }
    }

    /// Construct a SIWS message according to the specification
    #[cfg(not(target_arch = "wasm32"))]
    fn construct_siws_message(&self, tx_hash: &Felt) -> String {
        // Convert public key to base58 encoding (simplified for example)
        let pubkey_base58 = bs58::encode(&self.pubkey).into_string();

        // Create statement with the transaction hash
        let statement = format!("Authorize Controller session with hash: 0x{:x}", tx_hash);

        // Format according to SIWS specification
        format!(
            "{} wants you to sign in with your Solana account:\n{}\n\n{}",
            self.domain, pubkey_base58, statement
        )
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[async_trait]
impl HashSigner for SIWSSigner {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        use cainome::cairo_serde::{NonZero, U256};
        use cainome_cairo_serde::CairoSerde;
        use num_bigint::BigUint;

        let message = self.construct_siws_message(tx_hash);

        let signature = self.keypair.sign(message.as_bytes());

        let pubkey = BigUint::from_bytes_le(&self.pubkey);

        let r = BigUint::from_bytes_le(signature.r_bytes());
        let s = BigUint::from_bytes_le(signature.s_bytes());

        let calldata = garaga_rs::calldata::signatures::eddsa_calldata_builder(
            r,
            s,
            pubkey,
            message.as_bytes().to_vec(),
        )
        .map_err(SignError::InvalidMessageError)?
        .iter()
        .map(|x| Felt::from(x.clone()))
        .collect::<Vec<_>>();

        let signature_with_hint = EdDSASignatureWithHint::cairo_deserialize(&calldata, 0).unwrap();

        let siws_signature = SIWSSignature {
            domain: self.domain.as_bytes().to_vec(),
            signature_with_hint,
        };

        let nonzero_pubkey = NonZero::new(U256::from_bytes_be(&self.pubkey))
            .unwrap_or_else(|| panic!("Public key cannot be zero"));
        let controller_signer = ControllerEd25519Signer {
            pubkey: nonzero_pubkey,
        };

        Ok(SignerSignature::SIWS((controller_signer, siws_signature)))
    }
}

impl From<ControllerEd25519Signer> for Felt {
    fn from(signer: ControllerEd25519Signer) -> Self {
        let mut state = PoseidonHasher::new();
        state.update(short_string!("SIWS Signer"));
        let pubkey = signer.pubkey.inner();
        state.update(pubkey.low.into());
        state.update(pubkey.high.into());
        state.finalize()
    }
}

#[cfg(target_arch = "wasm32")]
#[async_trait(?Send)]
impl HashSigner for SIWSSigner {
    async fn sign(&self, _tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        Err(SignError::InvalidMessageError(
            "SIWS signing not implemented for WASM".to_string(),
        ))
    }
}
