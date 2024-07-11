use account_sdk::signers::SignError;
use base64::DecodeError;
use coset::CoseError;
use starknet::{
    accounts::AccountError,
    core::{types::FromStrError, utils::NonAsciiNameError},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CartridgeError {
    #[error("Session error: {0}")]
    Session(#[from] SessionError),

    #[error("Account operation error: {0}")]
    Operation(#[from] OperationError),

    #[error("Encoding error: {0}")]
    Encoding(#[from] EncodingError),
}

#[derive(Error, Debug)]
pub enum SessionError {
    #[error("Failed to create session: {0}")]
    Creation(SignError),

    #[error("Failed to sign message: {0}")]
    Signing(SignError),
}

#[derive(Error, Debug)]
pub enum OperationError {
    #[error("Failed to delegate account: {0}")]
    Delegation(String),

    #[error("Failed to estimate fee: {0}")]
    FeeEstimation(String),

    #[error("Failed to execute transaction: {0}")]
    Execution(String),

    #[error("Failed to deploy account: {0}")]
    Deployment(String),

    #[error("Failed to sign message: {0}")]
    SignMessage(SignError),

    #[error(transparent)]
    AccountError(#[from] AccountError<SignError>),
}

#[derive(Error, Debug)]
pub enum EncodingError {
    #[error(transparent)]
    FromStr(#[from] FromStrError),

    #[error(transparent)]
    NonAsciiName(#[from] NonAsciiNameError),

    #[error("Base64 decoding error: {0}")]
    Base64Decode(#[from] DecodeError),

    #[error("COSE key error: {0}")]
    CoseKey(#[from] CoseError),

    #[error("Invalid JSON: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_wasm_bindgen::Error),
}
