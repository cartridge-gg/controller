use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::{
    account::session::hash::Session, controller::Backend, signers::DeviceError, OriginProvider,
};
use starknet::core::types::Felt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMetadata {
    pub session: Session,
    pub max_fee: Option<Felt>,
    pub credentials: Credentials,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credentials {
    pub authorization: Vec<Felt>,
    pub private_key: Felt,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageValue {
    Session(SessionMetadata),
}

#[async_trait]
pub trait StorageBackend: Send + Sync {
    fn set(&mut self, key: &str, value: &StorageValue) -> Result<(), StorageError>;
    fn get(&self, key: &str) -> Result<Option<StorageValue>, StorageError>;
    fn remove(&mut self, key: &str) -> Result<(), StorageError>;
    fn clear(&mut self) -> Result<(), StorageError>;
    fn keys(&self) -> Result<Vec<String>, StorageError>;
}

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Storage operation failed: {0}")]
    OperationFailed(String),
}

#[derive(Clone, Default)]
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
    fn origin() -> Result<String, DeviceError> {
        Ok("https://cartridge.gg".to_string())
    }
}

pub struct Selectors;

impl Selectors {
    pub fn active() -> String {
        "@cartridge/active".to_string()
    }

    pub fn account(address: &Felt) -> String {
        format!("@cartridge/account/0x{:x}", address)
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
