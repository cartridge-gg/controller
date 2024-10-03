use async_trait::async_trait;
use base64::Engine;
use coset::CborSerializable;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use url::Url;

use crate::{account::session::hash::Session, signers::DeviceError, Backend, OriginProvider};
use starknet::{core::types::Felt, signers::SigningKey};

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

impl<B> From<&Controller<B>> for ControllerMetadata
where
    B: Backend + Clone,
{
    fn from(controller: &Controller<B>) -> Self {
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
            &Selectors::account(&address),
            &StorageValue::Controller(metadata),
        )
    }
}

#[derive(Clone, Debug, Default)]
pub struct InMemoryBackend {
    storage: HashMap<String, String>,
}

impl Backend for InMemoryBackend {}

impl InMemoryBackend {
    pub fn new() -> Self {
        Self {
            storage: HashMap::new(),
        }
    }
}

#[async_trait]
impl StorageBackend for InMemoryBackend {
    fn set(&mut self, key: &str, value: &StorageValue) -> Result<(), StorageError> {
        let serialized = serde_json::to_string(value)?;
        self.storage.insert(key.to_string(), serialized);
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<StorageValue>, StorageError> {
        if let Some(value) = self.storage.get(key) {
            let deserialized = serde_json::from_str(value)?;
            Ok(Some(deserialized))
        } else {
            Ok(None)
        }
    }

    fn remove(&mut self, key: &str) -> Result<(), StorageError> {
        self.storage.remove(key);
        Ok(())
    }

    fn clear(&mut self) -> Result<(), StorageError> {
        self.storage.clear();
        Ok(())
    }

    fn keys(&self) -> Result<Vec<String>, StorageError> {
        Ok(self.storage.keys().cloned().collect())
    }
}

impl OriginProvider for InMemoryBackend {
    fn origin(&self) -> Result<String, DeviceError> {
        Ok("https://cartridge.gg".to_string())
    }
}

pub struct Selectors;

impl Selectors {
    pub fn active() -> String {
        "@cartridge/active".to_string()
    }

    pub fn account(address: &Felt) -> String {
        format!("@cartridge/account-v2/0x{:x}", address)
    }

    pub fn deployment(address: &Felt, chain_id: &Felt) -> String {
        format!("@cartridge/deployment/0x{:x}/0x{:x}", address, chain_id)
    }

    pub fn admin(address: &Felt, origin: &str) -> String {
        format!(
            "@cartridge/admin/0x{:x}/{}",
            address,
            urlencoding::encode(origin)
        )
    }

    pub fn session(address: &Felt, app_id: &str, chain_id: &Felt) -> String {
        format!(
            "@cartridge/session/0x{:x}/{}/0x{:x}",
            address,
            urlencoding::encode(app_id),
            chain_id
        )
    }
}
