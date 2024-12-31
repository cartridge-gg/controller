use starknet::{
    accounts::ConnectedAccount,
    core::types::{Call, InvokeTransactionResult},
    signers::SigningKey,
};

use crate::{
    abigen::controller::OutsideExecutionV3,
    account::{
        outside_execution::{OutsideExecution, OutsideExecutionAccount, OutsideExecutionCaller},
        outside_execution_v2::OutsideExecutionV2,
        session::policy::Policy,
    },
    controller::Controller,
    errors::ControllerError,
    provider::CartridgeProvider,
    storage::StorageBackend,
    utils::time::get_current_timestamp,
};

#[cfg(all(test, not(target_arch = "wasm32")))]
#[path = "execute_from_outside_test.rs"]
mod execute_from_outside_test;

impl Controller {
    pub async fn execute_from_outside_v2(
        &mut self,
        calls: Vec<Call>,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let now = get_current_timestamp();

        let outside_execution = OutsideExecutionV2 {
            caller: OutsideExecutionCaller::Any.into(),
            execute_after: 0,
            execute_before: now + 600,
            calls: calls.into_iter().map(|call| call.into()).collect(),
            nonce: SigningKey::from_random().secret_scalar(),
        };

        let signed = self
            .sign_outside_execution(OutsideExecution::V2(outside_execution.clone()))
            .await?;

        let res = self
            .provider()
            .add_execute_outside_transaction(
                OutsideExecution::V2(outside_execution),
                self.address,
                signed.signature,
            )
            .await
            .map_err(ControllerError::PaymasterError)?;

        Ok(InvokeTransactionResult {
            transaction_hash: res.transaction_hash,
        })
    }

    pub async fn execute_from_outside_v3(
        &mut self,
        calls: Vec<Call>,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let now = get_current_timestamp();

        // Get the current namespace and bitmask
        let (mut namespace, mut bitmask) = self.execute_from_outside_nonce;

        // Find the next available bit
        let nonce_bitmask = if bitmask == u64::MAX.into() {
            // All bits are used, create new namespace and reset bitmask
            namespace = SigningKey::from_random().secret_scalar();
            bitmask = 1;
            1u128
        } else {
            // Find the least significant zero bit
            let next_bit = bitmask.trailing_ones();
            let new_bit = 1u128 << next_bit;
            bitmask |= new_bit;
            new_bit
        };

        // Update self.execute_from_outside_nonce with the new namespace and bitmask
        self.execute_from_outside_nonce = (namespace, bitmask);

        let outside_execution = OutsideExecutionV3 {
            caller: OutsideExecutionCaller::Any.into(),
            execute_after: 0,
            execute_before: now + 600,
            calls: calls.clone().into_iter().map(|call| call.into()).collect(),
            nonce: (namespace, nonce_bitmask),
        };

        let signed = self
            .sign_outside_execution(OutsideExecution::V3(outside_execution.clone()))
            .await?;

        let res = self
            .provider()
            .add_execute_outside_transaction(
                OutsideExecution::V3(outside_execution),
                self.address,
                signed.signature,
            )
            .await
            .map_err(ControllerError::PaymasterError)?;

        // Update is_registered to true after successful execution with a session
        if let Some((key, metadata)) =
            self.authorized_session_metadata(&Policy::from_calls(&calls), None)
        {
            if !metadata.is_registered {
                let mut updated_metadata = metadata;
                updated_metadata.is_registered = true;
                self.storage.set_session(&key, updated_metadata)?;
            }
        }

        Ok(InvokeTransactionResult {
            transaction_hash: res.transaction_hash,
        })
    }
}
