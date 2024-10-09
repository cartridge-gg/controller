use async_trait::async_trait;
use std::collections::HashMap;

use super::{StorageBackend, StorageError, StorageValue};

#[derive(Clone, Debug, Default)]
pub struct InMemoryBackend {
    storage: HashMap<String, String>,
}

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
