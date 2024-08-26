use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum SignerType {
    Starknet,
    Secp256k1,
    Secp256r1,
    Eip191,
    Webauthn,
}

#[wasm_bindgen]
pub struct Signer {
    pub(crate) signer_type: SignerType,
    pub(crate) credential_id: Option<String>,
    pub(crate) public_key: Option<String>,
    pub(crate) private_key: Option<String>,
}
