use starknet::core::types::ContractExecutionError;

pub fn contract_error_contains(error: &ContractExecutionError, message: &str) -> bool {
    match error {
        ContractExecutionError::Message(error) => error == message,
        ContractExecutionError::Nested(inner) => contract_error_contains(&inner.error, message),
    }
}
