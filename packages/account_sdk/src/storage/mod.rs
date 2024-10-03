use async_trait::async_trait;
use base64::Engine;
use coset::CborSerializable;
use serde::{Deserialize, Serialize};
use url::Url;

use crate::account::session::hash::Session;
use starknet::{core::types::Felt, signers::SigningKey};

#[cfg(not(target_arch = "wasm32"))]
pub mod inmemory;
#[cfg(target_arch = "wasm32")]
pub mod localstorage;
pub mod selectors;

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Storage operation failed: {0}")]
    OperationFailed(String),
    #[error("Type mismatch in storage")]
    TypeMismatch,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebauthnSigner {
    pub rp_id: String,
    pub credential_id: String,
    pub public_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StarknetSigner {
    pub private_key: Felt,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Signer {
    Starknet(StarknetSigner),
    Webauthn(WebauthnSigner),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerMetadata {
    pub address: Felt,
    pub class_hash: Felt,
    pub rpc_url: Url,
    pub chain_id: Felt,
    pub salt: Felt,
    pub owner: Signer,
}

use crate::controller::Controller;

impl From<&Controller> for ControllerMetadata {
    fn from(controller: &Controller) -> Self {
        ControllerMetadata {
            address: controller.address,
            class_hash: controller.class_hash,
            chain_id: controller.chain_id,
            rpc_url: controller.rpc_url.clone(),
            salt: controller.salt,
            owner: (&controller.owner).into(),
        }
    }
}

impl From<&crate::signers::Signer> for Signer {
    fn from(signer: &crate::signers::Signer) -> Self {
        match signer {
            crate::signers::Signer::Starknet(s) => Signer::Starknet(s.into()),
            crate::signers::Signer::Webauthn(s) => Signer::Webauthn(s.into()),
        }
    }
}

impl From<&SigningKey> for StarknetSigner {
    fn from(signer: &SigningKey) -> Self {
        StarknetSigner {
            private_key: signer.secret_scalar(),
        }
    }
}

impl From<&crate::signers::webauthn::WebauthnSigner> for WebauthnSigner {
    fn from(signer: &crate::signers::webauthn::WebauthnSigner) -> Self {
        WebauthnSigner {
            rp_id: signer.rp_id.clone(),
            credential_id: base64::engine::general_purpose::URL_SAFE_NO_PAD
                .encode(signer.credential_id.as_ref()),
            public_key: base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(
                signer
                    .pub_key
                    .clone()
                    .to_vec()
                    .expect("Public Key serialize to bytes"),
            ),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SessionMetadata {
    pub session: Session,
    pub max_fee: Option<Felt>,
    pub credentials: Option<Credentials>,
    pub is_registered: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Credentials {
    pub authorization: Vec<Felt>,
    pub private_key: Felt,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageValue {
    Controller(ControllerMetadata),
    Session(SessionMetadata),
}

#[async_trait]
pub trait StorageBackend: Send + Sync {
    fn set(&mut self, key: &str, value: &StorageValue) -> Result<(), StorageError>;
    fn get(&self, key: &str) -> Result<Option<StorageValue>, StorageError>;
    fn remove(&mut self, key: &str) -> Result<(), StorageError>;
    fn clear(&mut self) -> Result<(), StorageError>;
    fn keys(&self) -> Result<Vec<String>, StorageError>;

    fn session(&self, key: &str) -> Result<Option<SessionMetadata>, StorageError> {
        self.get(key).and_then(|value| match value {
            Some(StorageValue::Session(metadata)) => Ok(Some(metadata)),
            Some(_) => Err(StorageError::TypeMismatch),
            None => Ok(None),
        })
    }

    fn set_session(&mut self, key: &str, metadata: SessionMetadata) -> Result<(), StorageError> {
        self.set(key, &StorageValue::Session(metadata))
    }

    fn controller(&self, key: &str) -> Result<Option<ControllerMetadata>, StorageError> {
        self.get(key).and_then(|value| match value {
            Some(StorageValue::Controller(metadata)) => Ok(Some(metadata)),
            Some(_) => Err(StorageError::TypeMismatch),
            None => Ok(None),
        })
    }

    fn set_controller(
        &mut self,
        address: Felt,
        metadata: ControllerMetadata,
    ) -> Result<(), StorageError> {
        self.set(
            &selectors::Selectors::account(&address),
            &StorageValue::Controller(metadata),
        )
    }
}

#[cfg(not(target_arch = "wasm32"))]
pub type Storage = inmemory::InMemoryBackend;

#[cfg(target_arch = "wasm32")]
pub type Storage = localstorage::LocalStorage;
