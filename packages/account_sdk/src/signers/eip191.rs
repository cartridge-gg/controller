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
use cainome::cairo_serde::U256;
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
        // Format address for the bridge
        let address_hex = format!("0x{}", hex::encode(self.address.clone().as_bytes()));
        let message_hex = hex::encode(tx_hash.to_bytes_be());

        // Call the external signing function via the bridge
        let signature_hex = external_sign_message(&address_hex, &message_hex).await?;

        // Parse the combined hex signature (r, s, v)
        let signature_bytes = hex::decode(signature_hex.trim_start_matches("0x")).map_err(|e| {
            SignError::BridgeError(format!("Failed to decode signature hex: {}", e))
        })?;

        if signature_bytes.len() != 65 {
            return Err(SignError::BridgeError(format!(
                "Invalid signature length from bridge: expected 65, got {}",
                signature_bytes.len()
            )));
        }

        let r_bytes_slice = &signature_bytes[0..32];
        let s_bytes_slice = &signature_bytes[32..64];
        let v_byte = signature_bytes[64];

        // Convert r and s slices to fixed-size arrays
        let r_bytes: &[u8; 32] = r_bytes_slice.try_into().map_err(|_| {
            SignError::BridgeError("Failed to convert r bytes to fixed array".to_string())
        })?;
        let s_bytes: &[u8; 32] = s_bytes_slice.try_into().map_err(|_| {
            SignError::BridgeError("Failed to convert s bytes to fixed array".to_string())
        })?;

        // Convert r and s to U256 using the array reference
        let r = U256::from_bytes_be(r_bytes);
        let s = U256::from_bytes_be(s_bytes);

        // Calculate y_parity from v (normalize 27/28 or 0/1 to bool)
        // Starknet expects y_parity: 0 or 1. Ethereum uses v: 27 or 28.
        // y_parity is true if v is odd (1 or 27)
        let y_parity = v_byte % 2 != 0;

        // Create the controller structs
        let eth_address = cainome::cairo_serde::EthAddress(self.address().into());
        let controller_signer = ControllerEip191Signer { eth_address };
        let signature = ControllerSignature { r, s, y_parity };

        Ok(SignerSignature::Eip191((controller_signer, signature)))
    }
}

impl From<Eip191Signer> for crate::signers::Signer {
    fn from(signer: Eip191Signer) -> Self {
        crate::signers::Signer::Eip191(signer)
    }
}

#[cfg(all(test, target_arch = "wasm32"))]
mod wasm_tests {
    use super::*;
    use starknet::core::types::Felt;
    use std::str::FromStr;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_test::*;

    // Configure wasm-bindgen test runner
    wasm_bindgen_test_configure!(run_in_browser);

    // Define the mock wallet bridge JS interface
    #[wasm_bindgen(inline_js = r#"
        export function setup_mock_bridge() {
            if (!window.wallet_bridge) { window.wallet_bridge = {}; }

            window.wallet_bridge.signMessage = (identifier, message) => {
                console.log(`Mock bridge called: signMessage(${identifier}, ${message})`);

                // --- Define Expected Test Values --- 
                const expectedIdentifier = "0x0102030405060708090a0b0c0d0e0f1011121314";
                // Note: JS doesn't handle Felt directly, we expect the hex string from Rust
                const expectedMessageHex = "0000000000000000000000000000000000000000000000000000000000012345";
                const mockSignatureHex = "0x790a151f5bcb03f5adeb6c5780e1d7e229c44f8767043f90663b621124945a31510c283547586f70c39ac8e7bfb4546e4596640d6c54a7f21d8a42e315174a7c1b";
                const mockErrorMsg = "Simulated bridge error";

                // --- Mock Logic --- 
                return new Promise((resolve, reject) => {
                    if (identifier === expectedIdentifier && message === expectedMessageHex) {
                        // Simulate successful signing
                        const response = {
                            success: true,
                            wallet: "metamask", // Type doesn't strictly matter for this test
                            result: mockSignatureHex,
                            error: null,
                            account: identifier
                        };
                        console.log("Mock bridge resolving successfully with:", response);
                        resolve(response);
                    } else {
                         // Simulate failure (e.g., wrong identifier or message)
                         const response = {
                            success: false,
                            wallet: "metamask",
                            result: null,
                            error: `Unexpected input. Identifier: ${identifier}, Message: ${message}. Expected: ${expectedIdentifier}, ${expectedMessageHex}`,
                            account: identifier
                         };
                        console.error("Mock bridge rejecting with:", response);
                        // Note: The Rust binding uses 'catch', so we resolve with the error structure
                        // resolve(response);
                        // Actually, the wasm_bindgen `catch` expects the promise to reject for JS errors.
                        // For application errors (like failed sig), the promise resolves with success:false.
                        resolve(response);
                    }
                });
            };
            console.log("Mock wallet_bridge setup complete.", window.wallet_bridge);
        }
    "#)]
    extern "C" {
        fn setup_mock_bridge();
    }

    #[wasm_bindgen_test]
    async fn test_eip191_wasm_sign_success() {
        // Setup the mock bridge in the JS environment
        setup_mock_bridge();

        // --- Test Data ---
        let address_hex = "0x0102030405060708090a0b0c0d0e0f1011121314";
        let address = EthAddress::from_str(address_hex).expect("Failed to parse test address");
        let tx_hash = Felt::from_hex_unchecked("0x12345");

        // Create the signer instance
        let signer = Eip191Signer { address };

        // Expected signature components derived from the mock hex signature
        let expected_r =
            U256::from_str("0x790a151f5bcb03f5adeb6c5780e1d7e229c44f8767043f90663b621124945a31")
                .unwrap();
        let expected_s =
            U256::from_str("0x510c283547586f70c39ac8e7bfb4546e4596640d6c54a7f21d8a42e315174a7c")
                .unwrap();
        let expected_y_parity = true; // v = 0x1b (27) is odd

        // --- Execute Test ---
        let result = signer.sign(&tx_hash).await;

        // --- Assertions ---
        assert!(result.is_ok(), "Signing failed: {:?}", result.err());
        match result.unwrap() {
            SignerSignature::Eip191((controller_signer, signature)) => {
                assert_eq!(
                    controller_signer.eth_address.0.to_string(),
                    address_hex,
                    "Signer address mismatch"
                );
                assert_eq!(signature.r, expected_r, "Signature R mismatch");
                assert_eq!(signature.s, expected_s, "Signature S mismatch");
                assert_eq!(
                    signature.y_parity, expected_y_parity,
                    "Signature Y-Parity mismatch"
                );
            }
            _ => panic!("Unexpected SignerSignature variant"),
        }
    }

    #[wasm_bindgen_test]
    async fn test_eip191_wasm_sign_bridge_error() {
        // Setup the mock bridge
        setup_mock_bridge();

        // Use a different address to trigger the error case in the mock bridge
        let wrong_address_hex = "0xffffffffffffffffffffffffffffffffffffffff";
        let address =
            EthAddress::from_str(wrong_address_hex).expect("Failed to parse wrong address");
        let tx_hash = Felt::from_hex_unchecked("0x12345");

        let signer = Eip191Signer { address };

        // Execute
        let result = signer.sign(&tx_hash).await;

        // Assertions
        assert!(result.is_err(), "Signing should have failed");
        match result.err().unwrap() {
            SignError::BridgeError(msg) => {
                assert!(
                    msg.contains("Unexpected input"),
                    "Error message mismatch: {}",
                    msg
                );
                assert!(
                    msg.contains(wrong_address_hex),
                    "Error message should contain wrong address: {}",
                    msg
                );
            }
            e => panic!("Unexpected error type: {:?}", e),
        }
    }
}
