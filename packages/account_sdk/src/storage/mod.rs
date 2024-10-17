use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use starknet::{core::types::Felt, signers::SigningKey};

use crate::{account::session::hash::Session, errors::ControllerError};

#[cfg(feature = "webauthn")]
use {
    crate::signers::webauthn::CredentialID,
    base64::{engine::general_purpose, Engine},
    coset::{CborSerializable, CoseKey},
};

#[cfg(all(not(target_arch = "wasm32"), feature = "filestorage"))]
pub mod filestorage;
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
    #[cfg(feature = "webauthn")]
    Webauthn(WebauthnSigner),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Owner {
    Signer(Signer),
    Account(Felt),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerMetadata {
    pub username: String,
    pub class_hash: Felt,
    pub rpc_url: String,
    pub salt: Felt,
    pub owner: Owner,
    pub address: Felt,
    pub chain_id: Felt,
}

use crate::controller::Controller;

impl From<&Controller> for ControllerMetadata {
    fn from(controller: &Controller) -> Self {
        ControllerMetadata {
            address: controller.address,
            class_hash: controller.class_hash,
            chain_id: controller.chain_id,
            rpc_url: controller.rpc_url.to_string(),
            salt: controller.salt,
            owner: (&controller.owner).into(),
            username: controller.username.clone(),
        }
    }
}

impl From<&crate::signers::Owner> for Owner {
    fn from(owner: &crate::signers::Owner) -> Self {
        match owner {
            crate::signers::Owner::Signer(signer) => Owner::Signer(signer.into()),
            crate::signers::Owner::Account(address) => Owner::Account(*address),
        }
    }
}

impl From<&crate::signers::Signer> for Signer {
    fn from(signer: &crate::signers::Signer) -> Self {
        match signer {
            crate::signers::Signer::Starknet(s) => Signer::Starknet(s.into()),
            #[cfg(feature = "webauthn")]
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

#[cfg(feature = "webauthn")]
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

impl TryFrom<Signer> for crate::signers::Signer {
    type Error = ControllerError;

    fn try_from(signer: Signer) -> Result<Self, Self::Error> {
        match signer {
            Signer::Starknet(s) => Ok(Self::Starknet(SigningKey::from_secret_scalar(
                s.private_key,
            ))),
            #[cfg(feature = "webauthn")]
            Signer::Webauthn(w) => {
                let credential_id_bytes =
                    general_purpose::URL_SAFE_NO_PAD.decode(w.credential_id)?;
                let credential_id = CredentialID::from(credential_id_bytes);

                let cose_bytes = general_purpose::URL_SAFE_NO_PAD.decode(w.public_key)?;
                let cose = CoseKey::from_slice(&cose_bytes)?;

                Ok(Self::Webauthn(
                    crate::signers::webauthn::WebauthnSigner::new(w.rp_id, credential_id, cose),
                ))
            }
        }
    }
}

impl TryFrom<Owner> for crate::signers::Owner {
    type Error = ControllerError;

    fn try_from(owner: Owner) -> Result<Self, Self::Error> {
        match owner {
            Owner::Signer(signer) => Ok(crate::signers::Owner::Signer(signer.try_into()?)),
            Owner::Account(address) => Ok(crate::signers::Owner::Account(address)),
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

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ActiveMetadata {
    address: Felt,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageValue {
    Active(ActiveMetadata),
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

    fn controller(&self, app_id: &str) -> Result<Option<ControllerMetadata>, StorageError> {
        self.get(&selectors::Selectors::active(app_id))
            .and_then(|value| match value {
                Some(StorageValue::Active(metadata)) => self
                    .get(&selectors::Selectors::account(&metadata.address))
                    .and_then(|value| match value {
                        Some(StorageValue::Controller(metadata)) => Ok(Some(metadata)),
                        Some(_) => Err(StorageError::TypeMismatch),
                        None => Ok(None),
                    }),
                Some(_) => Err(StorageError::TypeMismatch),
                None => Ok(None),
            })
    }

    fn set_controller(
        &mut self,
        app_id: &str,
        address: Felt,
        metadata: ControllerMetadata,
    ) -> Result<(), StorageError> {
        self.set(
            &selectors::Selectors::active(app_id),
            &StorageValue::Active(ActiveMetadata { address }),
        )?;
        self.set(
            &selectors::Selectors::account(&address),
            &StorageValue::Controller(metadata),
        )
    }
}

#[cfg(all(not(target_arch = "wasm32"), not(feature = "filestorage")))]
pub type Storage = inmemory::InMemoryBackend;

#[cfg(target_arch = "wasm32")]
pub type Storage = localstorage::LocalStorage;

#[cfg(all(not(target_arch = "wasm32"), feature = "filestorage"))]
pub type Storage = filestorage::FileSystemBackend;
