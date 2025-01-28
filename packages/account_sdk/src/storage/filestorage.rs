use super::{StorageBackend, StorageError, StorageValue};

use async_trait::async_trait;
use std::fs;
use std::io::Read;
use std::path::PathBuf;

#[derive(Clone)]
pub struct FileSystemBackend {
    base_path: PathBuf,
}

impl Default for FileSystemBackend {
    fn default() -> Self {
        let base_path = if let Ok(path) = std::env::var("CARTRIDGE_STORAGE_PATH") {
            PathBuf::from(path)
        } else {
            let config_dir = dirs::config_dir().unwrap_or_else(|| {
                std::env::current_dir().expect("Failed to get current directory")
            });
            config_dir.join("cartridge")
        };

        Self { base_path }
    }
}

impl FileSystemBackend {
    pub fn new(base_path: PathBuf) -> Self {
        Self { base_path }
    }

    fn file_path(&self, key: &str) -> PathBuf {
        self.base_path.join(key)
    }

    fn ensure_path_exists(&self, path: PathBuf) -> Result<(), StorageError> {
        fs::create_dir_all(path).map_err(|e| {
            StorageError::OperationFailed(format!("Failed to create directory: {}", e))
        })
    }
}

#[async_trait]
impl StorageBackend for FileSystemBackend {
    fn set(&mut self, key: &str, value: &StorageValue) -> Result<(), StorageError> {
        let serialized = serde_json::to_string(value)?;
        self.set_serialized(key, &serialized)
    }

    fn set_serialized(&mut self, key: &str, value: &str) -> Result<(), StorageError> {
        let path = self.file_path(key);
        if let Some(parent) = path.parent() {
            self.ensure_path_exists(parent.to_path_buf())?;
        }
        fs::write(&path, value)
            .map_err(|e| StorageError::OperationFailed(format!("Failed to write file: {}", e)))?;
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<StorageValue>, StorageError> {
        let path = self.file_path(key);
        if path.exists() {
            let mut file = fs::File::open(&path).map_err(|e| {
                StorageError::OperationFailed(format!("Failed to open file: {}", e))
            })?;
            let mut contents = String::new();
            file.read_to_string(&mut contents).map_err(|e| {
                StorageError::OperationFailed(format!("Failed to read file: {}", e))
            })?;
            let deserialized = serde_json::from_str(&contents)?;
            Ok(Some(deserialized))
        } else {
            Ok(None)
        }
    }

    fn remove(&mut self, key: &str) -> Result<(), StorageError> {
        let path = self.file_path(key);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| {
                StorageError::OperationFailed(format!("Failed to remove file: {}", e))
            })?;
        }
        Ok(())
    }

    fn clear(&mut self) -> Result<(), StorageError> {
        if self.base_path.exists() {
            fs::remove_dir_all(&self.base_path).map_err(|e| {
                StorageError::OperationFailed(format!("Failed to remove directory: {}", e))
            })?;
        }
        self.ensure_path_exists(self.base_path.clone())?;
        Ok(())
    }

    fn keys(&self) -> Result<Vec<String>, StorageError> {
        let mut keys = Vec::new();
        if self.base_path.exists() {
            for entry in fs::read_dir(&self.base_path).map_err(|e| {
                StorageError::OperationFailed(format!("Failed to read directory: {}", e))
            })? {
                let entry = entry.map_err(|e| {
                    StorageError::OperationFailed(format!("Failed to read directory entry: {}", e))
                })?;
                if entry
                    .file_type()
                    .map_err(|e| {
                        StorageError::OperationFailed(format!("Failed to get file type: {}", e))
                    })?
                    .is_file()
                {
                    if let Some(file_name) = entry.file_name().to_str() {
                        keys.push(file_name.to_string());
                    }
                }
            }
        }
        Ok(keys)
    }
}
