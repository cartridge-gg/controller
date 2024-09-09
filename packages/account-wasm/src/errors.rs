use std::fmt;

use account_sdk::{controller::ControllerError, paymaster::PaymasterError, signers::DeviceError};
use serde::Serialize;
use starknet::{accounts::AccountError, core::types::StarknetError, providers::ProviderError};
use starknet_types_core::felt::FromStrError;
use wasm_bindgen::prelude::*;

use crate::types::EncodingError;

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug, Serialize)]
pub struct JsControllerError {
    pub error_type: ErrorType,
    pub message: String,
    pub details: Option<String>,
}

impl From<JsError> for JsControllerError {
    fn from(error: JsError) -> Self {
        JsControllerError {
            error_type: ErrorType::StarknetUnexpectedError,
            message: JsValue::from(error).as_string().unwrap(),
            details: None,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Serialize)]
pub enum ErrorType {
    SignError,
    StorageError,
    AccountFactoryError,
    PaymasterExecutionTimeNotReached,
    PaymasterExecutionTimePassed,
    PaymasterInvalidCaller,
    PaymasterRateLimitExceeded,
    PaymasterNotSupported,
    PaymasterHttp,
    PaymasterExcecution,
    PaymasterSerialization,
    CartridgeControllerNotDeployed,
    InsufficientBalance,
    OriginError,
    EncodingError,
    SerdeWasmBindgenError,
    CairoSerdeError,
    CairoShortStringToFeltError,
    DeviceCreateCredential,
    DeviceGetAssertion,
    DeviceBadAssertion,
    DeviceChannel,
    DeviceOrigin,
    AccountSigning,
    AccountProvider,
    AccountClassHashCalculation,
    AccountClassCompression,
    AccountFeeOutOfRange,
    ProviderRateLimited,
    ProviderArrayLengthMismatch,
    ProviderOther,
    StarknetFailedToReceiveTransaction,
    StarknetContractNotFound,
    StarknetBlockNotFound,
    StarknetInvalidTransactionIndex,
    StarknetClassHashNotFound,
    StarknetTransactionHashNotFound,
    StarknetPageSizeTooBig,
    StarknetNoBlocks,
    StarknetInvalidContinuationToken,
    StarknetTooManyKeysInFilter,
    StarknetContractError,
    StarknetTransactionExecutionError,
    StarknetClassAlreadyDeclared,
    StarknetInvalidTransactionNonce,
    StarknetInsufficientMaxFee,
    StarknetInsufficientAccountBalance,
    StarknetValidationFailure,
    StarknetCompilationFailed,
    StarknetContractClassSizeIsTooLarge,
    StarknetNonAccount,
    StarknetDuplicateTx,
    StarknetCompiledClassHashMismatch,
    StarknetUnsupportedTxVersion,
    StarknetUnsupportedContractClassVersion,
    StarknetUnexpectedError,
    StarknetNoTraceAvailable,
}

impl From<ControllerError> for JsControllerError {
    fn from(error: ControllerError) -> Self {
        match error {
            ControllerError::SignError(e) => JsControllerError {
                error_type: ErrorType::SignError,
                message: e.to_string(),
                details: None,
            },
            ControllerError::StorageError(e) => JsControllerError {
                error_type: ErrorType::StorageError,
                message: e.to_string(),
                details: None,
            },
            ControllerError::AccountError(e) => e.into(),
            ControllerError::AccountFactoryError(e) => JsControllerError {
                error_type: ErrorType::AccountFactoryError,
                message: e.to_string(),
                details: None,
            },
            ControllerError::PaymasterError(e) => e.into(),
            ControllerError::ProviderError(e) => e.into(),
            ControllerError::CairoSerde(e) => JsControllerError {
                error_type: ErrorType::CairoSerdeError,
                message: e.to_string(),
                details: None,
            },
            ControllerError::NotDeployed {
                fee_estimate,
                balance,
            } => JsControllerError {
                error_type: ErrorType::CartridgeControllerNotDeployed,
                message: "Controller not deployed".to_string(),
                details: Some(
                    serde_json::to_string(&serde_json::json!({
                        "fee_estimate": fee_estimate,
                        "balance": balance
                    }))
                    .unwrap(),
                ),
            },
            ControllerError::InsufficientBalance {
                fee_estimate,
                balance,
            } => JsControllerError {
                error_type: ErrorType::InsufficientBalance,
                message: "Insufficient balance for transaction".to_string(),
                details: Some(
                    serde_json::to_string(&serde_json::json!({
                        "fee_estimate": fee_estimate,
                        "balance": balance
                    }))
                    .unwrap(),
                ),
            },
        }
    }
}

impl From<PaymasterError> for JsControllerError {
    fn from(error: PaymasterError) -> Self {
        let (error_type, message) = match error {
            PaymasterError::ExecutionTimeNotReached => (
                ErrorType::PaymasterExecutionTimeNotReached,
                "Execution time not yet reached".to_string(),
            ),
            PaymasterError::ExecutionTimePassed => (
                ErrorType::PaymasterExecutionTimePassed,
                "Execution time has passed".to_string(),
            ),
            PaymasterError::InvalidCaller => (
                ErrorType::PaymasterInvalidCaller,
                "Invalid caller".to_string(),
            ),
            PaymasterError::RateLimitExceeded => (
                ErrorType::PaymasterRateLimitExceeded,
                "Rate limit exceeded".to_string(),
            ),
            PaymasterError::PaymasterNotSupported => (
                ErrorType::PaymasterNotSupported,
                "Paymaster not supported".to_string(),
            ),
            PaymasterError::Serialization(e) => (ErrorType::PaymasterSerialization, e.to_string()),
            PaymasterError::ProviderError(e) => return e.into(),
        };

        JsControllerError {
            error_type,
            message,
            details: None,
        }
    }
}

impl From<DeviceError> for JsControllerError {
    fn from(e: DeviceError) -> Self {
        let (error_type, message) = match e {
            DeviceError::CreateCredential(msg) => (ErrorType::DeviceCreateCredential, msg),
            DeviceError::GetAssertion(msg) => (ErrorType::DeviceGetAssertion, msg),
            DeviceError::BadAssertion(msg) => (ErrorType::DeviceBadAssertion, msg),
            DeviceError::Channel(msg) => (ErrorType::DeviceChannel, msg),
            DeviceError::Origin(msg) => (ErrorType::DeviceOrigin, msg),
        };
        JsControllerError {
            error_type,
            message,
            details: None,
        }
    }
}

impl From<AccountError<account_sdk::signers::SignError>> for JsControllerError {
    fn from(e: AccountError<account_sdk::signers::SignError>) -> Self {
        let (error_type, message) = match e {
            AccountError::Signing(sign_error) => {
                (ErrorType::AccountSigning, sign_error.to_string())
            }
            AccountError::Provider(provider_error) => return provider_error.into(),
            AccountError::ClassHashCalculation(calc_error) => (
                ErrorType::AccountClassHashCalculation,
                calc_error.to_string(),
            ),
            AccountError::ClassCompression(compression_error) => (
                ErrorType::AccountClassCompression,
                compression_error.to_string(),
            ),
            AccountError::FeeOutOfRange => (
                ErrorType::AccountFeeOutOfRange,
                "Fee calculation overflow".to_string(),
            ),
        };

        JsControllerError {
            error_type,
            message,
            details: None,
        }
    }
}

impl From<ProviderError> for JsControllerError {
    fn from(e: ProviderError) -> Self {
        let (error_type, message) = match e {
            ProviderError::StarknetError(se) => return se.into(),
            ProviderError::RateLimited => (
                ErrorType::ProviderRateLimited,
                "Request rate limited".to_string(),
            ),
            ProviderError::ArrayLengthMismatch => (
                ErrorType::ProviderArrayLengthMismatch,
                "Array length mismatch".to_string(),
            ),
            ProviderError::Other(o) => (ErrorType::ProviderOther, o.to_string()),
        };
        JsControllerError {
            error_type,
            message,
            details: None,
        }
    }
}

impl From<StarknetError> for JsControllerError {
    fn from(e: StarknetError) -> Self {
        let (error_type, message, details) = match e {
            StarknetError::FailedToReceiveTransaction => (
                ErrorType::StarknetFailedToReceiveTransaction,
                "Failed to write transaction",
                None,
            ),
            StarknetError::ContractNotFound => (
                ErrorType::StarknetContractNotFound,
                "Contract not found",
                None,
            ),
            StarknetError::BlockNotFound => {
                (ErrorType::StarknetBlockNotFound, "Block not found", None)
            }
            StarknetError::InvalidTransactionIndex => (
                ErrorType::StarknetInvalidTransactionIndex,
                "Invalid transaction index in a block",
                None,
            ),
            StarknetError::ClassHashNotFound => (
                ErrorType::StarknetClassHashNotFound,
                "Class hash not found",
                None,
            ),
            StarknetError::TransactionHashNotFound => (
                ErrorType::StarknetTransactionHashNotFound,
                "Transaction hash not found",
                None,
            ),
            StarknetError::PageSizeTooBig => (
                ErrorType::StarknetPageSizeTooBig,
                "Requested page size is too big",
                None,
            ),
            StarknetError::NoBlocks => (ErrorType::StarknetNoBlocks, "There are no blocks", None),
            StarknetError::InvalidContinuationToken => (
                ErrorType::StarknetInvalidContinuationToken,
                "The supplied continuation token is invalid or unknown",
                None,
            ),
            StarknetError::TooManyKeysInFilter => (
                ErrorType::StarknetTooManyKeysInFilter,
                "Too many keys provided in a filter",
                None,
            ),
            StarknetError::ContractError(data) => (
                ErrorType::StarknetContractError,
                "Contract error",
                Some(data.revert_error),
            ),
            StarknetError::TransactionExecutionError(data) => (
                ErrorType::StarknetTransactionExecutionError,
                "Transaction execution error",
                Some(serde_json::to_string(&data).unwrap_or_default()),
            ),
            StarknetError::ClassAlreadyDeclared => (
                ErrorType::StarknetClassAlreadyDeclared,
                "Class already declared",
                None,
            ),
            StarknetError::InvalidTransactionNonce => (
                ErrorType::StarknetInvalidTransactionNonce,
                "Invalid transaction nonce",
                None,
            ),
            StarknetError::InsufficientMaxFee => (
                ErrorType::StarknetInsufficientMaxFee,
                "Max fee is smaller than the minimal transaction cost",
                None,
            ),
            StarknetError::InsufficientAccountBalance => (
                ErrorType::StarknetInsufficientAccountBalance,
                "Account balance is smaller than the transaction's max_fee",
                None,
            ),
            StarknetError::ValidationFailure(msg) => (
                ErrorType::StarknetValidationFailure,
                "Validation failure",
                Some(msg),
            ),
            StarknetError::CompilationFailed => (
                ErrorType::StarknetCompilationFailed,
                "Compilation failed",
                None,
            ),
            StarknetError::ContractClassSizeIsTooLarge => (
                ErrorType::StarknetContractClassSizeIsTooLarge,
                "Contract class size is too large",
                None,
            ),
            StarknetError::NonAccount => (
                ErrorType::StarknetNonAccount,
                "Sender address is not an account contract",
                None,
            ),
            StarknetError::DuplicateTx => (
                ErrorType::StarknetDuplicateTx,
                "A transaction with the same hash already exists in the mempool",
                None,
            ),
            StarknetError::CompiledClassHashMismatch => (
                ErrorType::StarknetCompiledClassHashMismatch,
                "The compiled class hash did not match the one supplied in the transaction",
                None,
            ),
            StarknetError::UnsupportedTxVersion => (
                ErrorType::StarknetUnsupportedTxVersion,
                "The transaction version is not supported",
                None,
            ),
            StarknetError::UnsupportedContractClassVersion => (
                ErrorType::StarknetUnsupportedContractClassVersion,
                "The contract class version is not supported",
                None,
            ),
            StarknetError::UnexpectedError(msg) => (
                ErrorType::StarknetUnexpectedError,
                "Unexpected error",
                Some(msg),
            ),
            StarknetError::NoTraceAvailable(data) => (
                ErrorType::StarknetNoTraceAvailable,
                "No trace available",
                Some(serde_json::to_string(&data).unwrap()),
            ),
        };

        JsControllerError {
            error_type,
            message: message.to_string(),
            details,
        }
    }
}

impl From<EncodingError> for JsControllerError {
    fn from(error: EncodingError) -> Self {
        JsControllerError {
            error_type: ErrorType::EncodingError,
            message: error.to_string(),
            details: None,
        }
    }
}

impl From<serde_wasm_bindgen::Error> for JsControllerError {
    fn from(error: serde_wasm_bindgen::Error) -> Self {
        JsControllerError {
            error_type: ErrorType::SerdeWasmBindgenError,
            message: error.to_string(),
            details: None,
        }
    }
}

impl From<FromStrError> for JsControllerError {
    fn from(error: FromStrError) -> Self {
        JsControllerError {
            error_type: ErrorType::EncodingError,
            message: "Failed to parse string to Felt".to_string(),
            details: Some(error.to_string()),
        }
    }
}

impl fmt::Display for JsControllerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let json = serde_json::json!({
            "error_type": self.error_type,
            "message": self.message,
            "details": self.details
        });
        write!(f, "{}", json.to_string())
    }
}

impl std::error::Error for JsControllerError {}
