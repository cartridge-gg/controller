use account_sdk::signers::HashSigner;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum SignerType {
    Starknet,
    // Secp256k1,
    // Secp256r1,
    // Eip191,
    Webauthn,
}

#[wasm_bindgen]
pub struct Signer {
    pub(crate) signer_type: SignerType,
    pub(crate) credential_id: Option<String>,
    pub(crate) public_key: Option<String>,
    pub(crate) private_key: Option<String>,
}

#[wasm_bindgen]
impl Signer {
    pub fn New(rp_id: &str) -> Result<Box<dyn HashSigner>, JsError> {
        match self.signer_type {
            SignerType::Webauthn => {
                let credential_id_bytes = general_purpose::URL_SAFE_NO_PAD
                    .decode(self.credential_id.as_ref().ok_or("Missing credential_id")?)?;
                let credential_id = CredentialID::from(credential_id_bytes);

                let cose_bytes = general_purpose::URL_SAFE_NO_PAD
                    .decode(self.public_key.as_ref().ok_or("Missing public_key")?)?;
                let cose = CoseKey::from_slice(&cose_bytes)?;

                Ok(Box::new(WebauthnSigner::new(
                    rp_id.to_string(),
                    credential_id,
                    cose,
                    BrowserBackend,
                )))
            }
            SignerType::Starknet => {
                // Implement Starknet signer creation
                unimplemented!("Starknet signer not implemented")
            }
            // Add other signer types as needed
            _ => Err(OperationError::UnsupportedSignerType.into()),
        }
    }
}

#[wasm_bindgen]
impl HashSigner for Signer {
    pub fn to_hash&self, rp_id: &str) -> Result<Box<dyn HashSigner>, JsError> {
        match self.signer_type {
            SignerType::Webauthn => {
                let credential_id_bytes = general_purpose::URL_SAFE_NO_PAD
                    .decode(self.credential_id.as_ref().ok_or("Missing credential_id")?)?;
                let credential_id = CredentialID::from(credential_id_bytes);

                let cose_bytes = general_purpose::URL_SAFE_NO_PAD
                    .decode(self.public_key.as_ref().ok_or("Missing public_key")?)?;
                let cose = CoseKey::from_slice(&cose_bytes)?;

                Ok(Box::new(WebauthnSigner::new(
                    rp_id.to_string(),
                    credential_id,
                    cose,
                    BrowserBackend,
                )))
            }
            SignerType::Starknet => {
                // Implement Starknet signer creation
                unimplemented!("Starknet signer not implemented")
            }
            // Add other signer types as needed
            _ => Err(OperationError::UnsupportedSignerType.into()),
        }
    }
}
