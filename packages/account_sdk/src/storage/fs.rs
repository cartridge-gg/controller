use async_trait::async_trait;
use super::{StorageBackend, StorageError, StorageValue};
use std::path::{Path, PathBuf};
use std::fs;
use std::io::{Read, Write};

pub struct FileSystemBackend {
    base_path: PathBuf,
}

impl FileSystemBackend {
    pub fn new() -> Result<Self, StorageError> {
        let config_dir = utils::config_dir()
            .ok_or_else(|| StorageError::OperationFailed("Failed to get config directory".into()))?;
        Ok(Self { base_path: config_dir })
    }

    fn file_path(&self, key: &str) -> PathBuf {
        self.base_path.join(key)
    }
}

#[async_trait]
impl StorageBackend for FileSystemBackend {
    fn set(&mut self, key: &str, value: &StorageValue) -> Result<(), StorageError> {
        let path = self.file_path(key);
        let serialized = serde_json::to_string(value)?;
        fs::create_dir_all(&self.base_path)
            .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
        fs::write(path, serialized)
            .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<StorageValue>, StorageError> {
        let path = self.file_path(key);
        if path.exists() {
            let mut file = fs::File::open(&path)
                .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
            let mut contents = String::new();
            file.read_to_string(&mut contents)
                .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
            let deserialized = serde_json::from_str(&contents)?;
            Ok(Some(deserialized))
        } else {
            Ok(None)
        }
    }

    fn remove(&mut self, key: &str) -> Result<(), StorageError> {
        let path = self.file_path(key);
        if path.exists() {
            fs::remove_file(path)
                .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
        }
        Ok(())
    }

    fn clear(&mut self) -> Result<(), StorageError> {
        if self.base_path.exists() {
            fs::remove_dir_all(&self.base_path)
                .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
        }
        fs::create_dir_all(&self.base_path)
            .map_err(|e| StorageError::OperationFailed(e.to_string()))?;
        Ok(())
    }

    fn keys(&self) -> Result<Vec<String>, StorageError> {
        let mut keys = Vec::new();
        if self.base_path.exists() {
            for entry in fs::read_dir(&self.base_path)
                .map_err(|e| StorageError::OperationFailed(e.to_string()))?
            {
                let entry = entry.map_err(|e| StorageError::OperationFailed(e.to_string()))?;
                if entry.file_type().map_err(|e| StorageError::OperationFailed(e.to_string()))?.is_file() {
                    if let Some(file_name) = entry.file_name().to_str() {
                        keys.push(file_name.to_string());
                    }
                }
            }
        }
        Ok(keys)
    }
}