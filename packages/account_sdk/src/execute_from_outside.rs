use starknet::{
    accounts::ConnectedAccount,
    core::types::{Call, InvokeTransactionResult},
};

use crate::{
    abigen::controller::OutsideExecution,
    account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller},
    controller::Controller,
    errors::ControllerError,
    provider::CartridgeProvider,
    utils::time::get_current_timestamp,
};

#[cfg(all(test, not(target_arch = "wasm32")))]
#[path = "execute_from_outside_test.rs"]
mod execute_from_outside_test;

impl Controller {
    async fn execute_from_outside_raw(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let signed = self
            .sign_outside_execution(outside_execution.clone())
            .await?;

        let res = self
            .provider()
            .add_execute_outside_transaction(outside_execution, self.address, signed.signature)
            .await
            .map_err(ControllerError::PaymasterError)?;

        Ok(InvokeTransactionResult {
            transaction_hash: res.transaction_hash,
        })
    }

    pub async fn execute_from_outside(
        &self,
        calls: Vec<Call>,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let now = get_current_timestamp();

        let outside_execution = OutsideExecution {
            caller: OutsideExecutionCaller::Any.into(),
            execute_after: 0,
            execute_before: now + 600,
            calls: calls.into_iter().map(|call| call.into()).collect(),
            nonce: self.execute_from_outside_nonce,
        };

        self.execute_from_outside_raw(outside_execution).await
    }
}
