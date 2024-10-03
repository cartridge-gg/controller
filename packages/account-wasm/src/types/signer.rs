use account_sdk::signers::webauthn::CredentialID;
// use account_sdk::signers::webauthn::WebauthnSigner;
use base64::engine::general_purpose;
use base64::Engine;
use coset::CborSerializable;
use coset::CoseKey;
use serde::{Deserialize, Serialize};
use starknet::signers::SigningKey;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use super::EncodingError;
use super::JsFelt;

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct WebauthnSigner {
    pub rp_id: String,
    pub credential_id: String,
    pub public_key: String,
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct StarknetSigner {
    pub private_key: JsFelt,
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Signer {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub webauthn: Option<WebauthnSigner>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starknet: Option<StarknetSigner>,
}

impl TryFrom<WebauthnSigner> for account_sdk::signers::webauthn::WebauthnSigner {
    type Error = EncodingError;

    fn try_from(webauthn: WebauthnSigner) -> Result<Self, Self::Error> {
        let credential_id_bytes = general_purpose::URL_SAFE_NO_PAD
            .decode(webauthn.credential_id)
            .map_err(|_| {
                EncodingError::Serialization(serde_wasm_bindgen::Error::new(
                    "Invalid credential_id",
                ))
            })?;
        let credential_id = CredentialID::from(credential_id_bytes);
        let cose_bytes = general_purpose::URL_SAFE_NO_PAD
            .decode(webauthn.public_key)
            .map_err(|_| {
                EncodingError::Serialization(serde_wasm_bindgen::Error::new("Invalid public_key"))
            })?;
        let cose = CoseKey::from_slice(&cose_bytes).map_err(|_| {
            EncodingError::Serialization(serde_wasm_bindgen::Error::new("Invalid CoseKey"))
        })?;

        Ok(Self::new(webauthn.rp_id, credential_id, cose))
    }
}

impl TryFrom<StarknetSigner> for SigningKey {
    type Error = EncodingError;

    fn try_from(starknet: StarknetSigner) -> Result<Self, Self::Error> {
        Ok(SigningKey::from_secret_scalar(starknet.private_key.0))
    }
}

impl TryFrom<Signer> for account_sdk::signers::Signer {
    type Error = EncodingError;

    fn try_from(signer: Signer) -> Result<Self, Self::Error> {
        if let Some(webauthn) = signer.webauthn {
            Ok(Self::Webauthn(webauthn.try_into()?))
        } else if let Some(starknet) = signer.starknet {
            Ok(Self::Starknet(starknet.try_into()?))
        } else {
            Err(EncodingError::Serialization(
                serde_wasm_bindgen::Error::new("Missing signer data"),
            ))
        }
    }
}
