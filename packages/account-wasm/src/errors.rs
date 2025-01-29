use std::fmt;

use account_sdk::{
    errors::ControllerError, provider::ExecuteFromOutsideError, signers::DeviceError,
};
use serde::Serialize;
use starknet::{accounts::AccountError, core::types::StarknetError, providers::ProviderError};
use starknet_types_core::felt::FromStrError;
use wasm_bindgen::prelude::*;

use crate::types::EncodingError;

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug, Serialize)]
pub struct JsControllerError {
    pub code: ErrorCode,
    pub message: String,
    pub data: Option<String>,
}

impl From<JsError> for JsControllerError {
    fn from(error: JsError) -> Self {
        JsControllerError {
            code: ErrorCode::StarknetUnexpectedError,
            message: JsValue::from(error).as_string().unwrap(),
            data: None,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Serialize)]
pub enum ErrorCode {
    // Starknet-specific errors (0-100)
    StarknetFailedToReceiveTransaction = 1,
    StarknetContractNotFound = 20,
    StarknetBlockNotFound = 24,
    StarknetInvalidTransactionIndex = 27,
    StarknetClassHashNotFound = 28,
    StarknetTransactionHashNotFound = 29,
    StarknetPageSizeTooBig = 31,
    StarknetNoBlocks = 32,
    StarknetInvalidContinuationToken = 33,
    StarknetTooManyKeysInFilter = 34,
    StarknetContractError = 40,
    StarknetTransactionExecutionError = 41,
    StarknetClassAlreadyDeclared = 51,
    StarknetInvalidTransactionNonce = 52,
    StarknetInsufficientMaxFee = 53,
    StarknetInsufficientAccountBalance = 54,
    StarknetValidationFailure = 55,
    StarknetCompilationFailed = 56,
    StarknetContractClassSizeIsTooLarge = 57,
    StarknetNonAccount = 58,
    StarknetDuplicateTx = 59,
    StarknetCompiledClassHashMismatch = 60,
    StarknetUnsupportedTxVersion = 61,
    StarknetUnsupportedContractClassVersion = 62,
    StarknetUnexpectedError = 63,
    StarknetNoTraceAvailable = 10,

    // Custom errors (101 and onwards)
    SignError = 101,
    StorageError = 102,
    AccountFactoryError = 103,
    PaymasterExecutionTimeNotReached = 104,
    PaymasterExecutionTimePassed = 105,
    PaymasterInvalidCaller = 106,
    PaymasterRateLimitExceeded = 107,
    PaymasterNotSupported = 108,
    PaymasterHttp = 109,
    PaymasterExcecution = 110,
    PaymasterSerialization = 111,
    CartridgeControllerNotDeployed = 112,
    InsufficientBalance = 113,
    OriginError = 114,
    EncodingError = 115,
    SerdeWasmBindgenError = 116,
    CairoSerdeError = 117,
    CairoShortStringToFeltError = 118,
    DeviceCreateCredential = 119,
    DeviceGetAssertion = 120,
    DeviceBadAssertion = 121,
    DeviceChannel = 122,
    DeviceOrigin = 123,
    AccountSigning = 124,
    AccountProvider = 125,
    AccountClassHashCalculation = 126,
    AccountClassCompression = 127,
    AccountFeeOutOfRange = 128,
    ProviderRateLimited = 129,
    ProviderArrayLengthMismatch = 130,
    ProviderOther = 131,
    SessionAlreadyRegistered = 132,
    UrlParseError = 133,
    Base64DecodeError = 134,
    CoseError = 135,
    PolicyChainIdMismatch = 136,
}

impl From<ControllerError> for JsControllerError {
    fn from(error: ControllerError) -> Self {
        match error {
            ControllerError::SignError(e) => JsControllerError {
                code: ErrorCode::SignError,
                message: e.to_string(),
                data: None,
            },
            ControllerError::StorageError(e) => JsControllerError {
                code: ErrorCode::StorageError,
                message: e.to_string(),
                data: None,
            },
            ControllerError::AccountError(e) => e.into(),
            ControllerError::AccountFactoryError(e) => JsControllerError {
                code: ErrorCode::AccountFactoryError,
                message: e.to_string(),
                data: None,
            },
            ControllerError::PaymasterError(e) => e.into(),
            ControllerError::ProviderError(e) => e.into(),
            ControllerError::CairoSerde(e) => JsControllerError {
                code: ErrorCode::CairoSerdeError,
                message: e.to_string(),
                data: None,
            },
            ControllerError::NotDeployed {
                fee_estimate,
                balance,
            } => JsControllerError {
                code: ErrorCode::CartridgeControllerNotDeployed,
                message: "Controller not deployed".to_string(),
                data: Some(
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
                code: ErrorCode::InsufficientBalance,
                message: "Insufficient balance for transaction".to_string(),
                data: Some(
                    serde_json::to_string(&serde_json::json!({
                        "fee_estimate": fee_estimate,
                        "balance": balance
                    }))
                    .unwrap(),
                ),
            },
            ControllerError::SessionAlreadyRegistered => JsControllerError {
                code: ErrorCode::SessionAlreadyRegistered,
                message: "Session already registered".to_string(),
                data: None,
            },
            ControllerError::UrlParseError(e) => JsControllerError {
                code: ErrorCode::UrlParseError,
                message: format!("Failed to parse URL: {}", e),
                data: None,
            },
            ControllerError::Base64DecodeError(e) => JsControllerError {
                code: ErrorCode::Base64DecodeError,
                message: format!("Failed to decode Base64: {}", e),
                data: None,
            },
            ControllerError::CoseError(e) => JsControllerError {
                code: ErrorCode::CoseError,
                message: format!("COSE error: {}", e),
                data: None,
            },
        }
    }
}

impl From<ExecuteFromOutsideError> for JsControllerError {
    fn from(error: ExecuteFromOutsideError) -> Self {
        let (code, message) = match error {
            ExecuteFromOutsideError::ExecutionTimeNotReached => (
                ErrorCode::PaymasterExecutionTimeNotReached,
                "Execution time not yet reached".to_string(),
            ),
            ExecuteFromOutsideError::ExecutionTimePassed => (
                ErrorCode::PaymasterExecutionTimePassed,
                "Execution time has passed".to_string(),
            ),
            ExecuteFromOutsideError::InvalidCaller => (
                ErrorCode::PaymasterInvalidCaller,
                "Invalid caller".to_string(),
            ),
            ExecuteFromOutsideError::RateLimitExceeded => (
                ErrorCode::PaymasterRateLimitExceeded,
                "Rate limit exceeded".to_string(),
            ),
            ExecuteFromOutsideError::ExecuteFromOutsideNotSupported(data) => {
                return JsControllerError {
                    code: ErrorCode::PaymasterNotSupported,
                    message: "Paymaster not supported".to_string(),
                    data: Some(data),
                }
            }
            ExecuteFromOutsideError::Serialization(e) => {
                (ErrorCode::PaymasterSerialization, e.to_string())
            }
            ExecuteFromOutsideError::ProviderError(e) => return e.into(),
        };

        JsControllerError {
            code,
            message,
            data: None,
        }
    }
}

impl From<DeviceError> for JsControllerError {
    fn from(e: DeviceError) -> Self {
        let (code, message) = match e {
            DeviceError::CreateCredential(msg) => (ErrorCode::DeviceCreateCredential, msg),
            DeviceError::GetAssertion(msg) => (ErrorCode::DeviceGetAssertion, msg),
            DeviceError::BadAssertion(msg) => (ErrorCode::DeviceBadAssertion, msg),
            DeviceError::Channel(msg) => (ErrorCode::DeviceChannel, msg),
            DeviceError::Origin(msg) => (ErrorCode::DeviceOrigin, msg),
        };
        JsControllerError {
            code,
            message,
            data: None,
        }
    }
}

impl From<AccountError<account_sdk::signers::SignError>> for JsControllerError {
    fn from(e: AccountError<account_sdk::signers::SignError>) -> Self {
        let (code, message) = match e {
            AccountError::Signing(sign_error) => {
                (ErrorCode::AccountSigning, sign_error.to_string())
            }
            AccountError::Provider(provider_error) => return provider_error.into(),
            AccountError::ClassHashCalculation(calc_error) => (
                ErrorCode::AccountClassHashCalculation,
                calc_error.to_string(),
            ),
            AccountError::ClassCompression(compression_error) => (
                ErrorCode::AccountClassCompression,
                compression_error.to_string(),
            ),
            AccountError::FeeOutOfRange => (
                ErrorCode::AccountFeeOutOfRange,
                "Fee calculation overflow".to_string(),
            ),
        };

        JsControllerError {
            code,
            message,
            data: None,
        }
    }
}

impl From<ProviderError> for JsControllerError {
    fn from(e: ProviderError) -> Self {
        let (code, message) = match e {
            ProviderError::StarknetError(se) => return se.into(),
            ProviderError::RateLimited => (
                ErrorCode::ProviderRateLimited,
                "Request rate limited".to_string(),
            ),
            ProviderError::ArrayLengthMismatch => (
                ErrorCode::ProviderArrayLengthMismatch,
                "Array length mismatch".to_string(),
            ),
            ProviderError::Other(o) => (ErrorCode::ProviderOther, o.to_string()),
        };
        JsControllerError {
            code,
            message,
            data: None,
        }
    }
}

impl From<StarknetError> for JsControllerError {
    fn from(e: StarknetError) -> Self {
        let (code, message, data) = match e {
            StarknetError::FailedToReceiveTransaction => (
                ErrorCode::StarknetFailedToReceiveTransaction,
                "Failed to write transaction",
                None,
            ),
            StarknetError::ContractNotFound => (
                ErrorCode::StarknetContractNotFound,
                "Contract not found",
                None,
            ),
            StarknetError::BlockNotFound => {
                (ErrorCode::StarknetBlockNotFound, "Block not found", None)
            }
            StarknetError::InvalidTransactionIndex => (
                ErrorCode::StarknetInvalidTransactionIndex,
                "Invalid transaction index in a block",
                None,
            ),
            StarknetError::ClassHashNotFound => (
                ErrorCode::StarknetClassHashNotFound,
                "Class hash not found",
                None,
            ),
            StarknetError::TransactionHashNotFound => (
                ErrorCode::StarknetTransactionHashNotFound,
                "Transaction hash not found",
                None,
            ),
            StarknetError::PageSizeTooBig => (
                ErrorCode::StarknetPageSizeTooBig,
                "Requested page size is too big",
                None,
            ),
            StarknetError::NoBlocks => (ErrorCode::StarknetNoBlocks, "There are no blocks", None),
            StarknetError::InvalidContinuationToken => (
                ErrorCode::StarknetInvalidContinuationToken,
                "The supplied continuation token is invalid or unknown",
                None,
            ),
            StarknetError::TooManyKeysInFilter => (
                ErrorCode::StarknetTooManyKeysInFilter,
                "Too many keys provided in a filter",
                None,
            ),
            StarknetError::ContractError(data) => (
                ErrorCode::StarknetContractError,
                "Contract error",
                Some(data.revert_error),
            ),
            StarknetError::TransactionExecutionError(data) => (
                ErrorCode::StarknetTransactionExecutionError,
                "Transaction execution error",
                Some(serde_json::to_string(&data).unwrap_or_default()),
            ),
            StarknetError::ClassAlreadyDeclared => (
                ErrorCode::StarknetClassAlreadyDeclared,
                "Class already declared",
                None,
            ),
            StarknetError::InvalidTransactionNonce => (
                ErrorCode::StarknetInvalidTransactionNonce,
                "Invalid transaction nonce",
                None,
            ),
            StarknetError::InsufficientMaxFee => (
                ErrorCode::StarknetInsufficientMaxFee,
                "Max fee is smaller than the minimal transaction cost",
                None,
            ),
            StarknetError::InsufficientAccountBalance => (
                ErrorCode::StarknetInsufficientAccountBalance,
                "Account balance is smaller than the transaction's max_fee",
                None,
            ),
            StarknetError::ValidationFailure(msg) => (
                ErrorCode::StarknetValidationFailure,
                "Validation failure",
                Some(msg),
            ),
            StarknetError::CompilationFailed => (
                ErrorCode::StarknetCompilationFailed,
                "Compilation failed",
                None,
            ),
            StarknetError::ContractClassSizeIsTooLarge => (
                ErrorCode::StarknetContractClassSizeIsTooLarge,
                "Contract class size is too large",
                None,
            ),
            StarknetError::NonAccount => (
                ErrorCode::StarknetNonAccount,
                "Sender address is not an account contract",
                None,
            ),
            StarknetError::DuplicateTx => (
                ErrorCode::StarknetDuplicateTx,
                "A transaction with the same hash already exists in the mempool",
                None,
            ),
            StarknetError::CompiledClassHashMismatch => (
                ErrorCode::StarknetCompiledClassHashMismatch,
                "The compiled class hash did not match the one supplied in the transaction",
                None,
            ),
            StarknetError::UnsupportedTxVersion => (
                ErrorCode::StarknetUnsupportedTxVersion,
                "The transaction version is not supported",
                None,
            ),
            StarknetError::UnsupportedContractClassVersion => (
                ErrorCode::StarknetUnsupportedContractClassVersion,
                "The contract class version is not supported",
                None,
            ),
            StarknetError::UnexpectedError(msg) => (
                ErrorCode::StarknetUnexpectedError,
                "Unexpected error",
                Some(msg),
            ),
            StarknetError::NoTraceAvailable(data) => (
                ErrorCode::StarknetNoTraceAvailable,
                "No trace available",
                Some(serde_json::to_string(&data).unwrap()),
            ),
        };

        JsControllerError {
            code,
            message: message.to_string(),
            data,
        }
    }
}

impl From<EncodingError> for JsControllerError {
    fn from(error: EncodingError) -> Self {
        JsControllerError {
            code: ErrorCode::EncodingError,
            message: error.to_string(),
            data: None,
        }
    }
}

impl From<serde_wasm_bindgen::Error> for JsControllerError {
    fn from(error: serde_wasm_bindgen::Error) -> Self {
        JsControllerError {
            code: ErrorCode::SerdeWasmBindgenError,
            message: error.to_string(),
            data: None,
        }
    }
}

impl From<FromStrError> for JsControllerError {
    fn from(error: FromStrError) -> Self {
        JsControllerError {
            code: ErrorCode::EncodingError,
            message: "Failed to parse string to Felt".to_string(),
            data: Some(error.to_string()),
        }
    }
}

impl From<account_sdk::signers::SignError> for JsControllerError {
    fn from(error: account_sdk::signers::SignError) -> Self {
        JsControllerError {
            code: ErrorCode::SignError,
            message: error.to_string(),
            data: None,
        }
    }
}

impl From<url::ParseError> for JsControllerError {
    fn from(error: url::ParseError) -> Self {
        JsControllerError {
            code: ErrorCode::UrlParseError,
            message: error.to_string(),
            data: None,
        }
    }
}

impl From<starknet::accounts::NotPreparedError> for JsControllerError {
    fn from(error: starknet::accounts::NotPreparedError) -> Self {
        JsControllerError {
            code: ErrorCode::StarknetUnexpectedError,
            message: error.to_string(),
            data: None,
        }
    }
}

impl fmt::Display for JsControllerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let json = serde_json::json!({
            "code": self.code,
            "message": self.message,
            "data": self.data
        });
        write!(f, "{}", json)
    }
}

impl std::error::Error for JsControllerError {}
