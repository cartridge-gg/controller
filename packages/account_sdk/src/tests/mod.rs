use std::time::Duration;

use starknet::{
    accounts::{Account, AccountError, ConnectedAccount, ExecutionV1},
    providers::Provider,
};
use starknet_crypto::Felt;
use thiserror::Error;

use crate::transaction_waiter::{TransactionWaiter, TransactionWaitingError};

pub(crate) mod account;
pub(crate) mod runners;

mod declare_test;
mod delegate_account_test;
mod external_owners_test;
mod guardian_test;
mod outside_execution_test;
mod owner_test;
mod register_session_test;
mod session_test;

#[derive(Error, Debug)]
pub enum EnsureTxnError<S> {
    #[error(transparent)]
    ExecutionError(#[from] AccountError<S>),
    #[error(transparent)]
    TransactionWaitingError(#[from] TransactionWaitingError),
}

pub async fn ensure_txn<A, P>(
    execution: ExecutionV1<'_, A>,
    provider: &P,
) -> Result<Felt, EnsureTxnError<A::SignError>>
where
    A: Account + ConnectedAccount + Sync,
    P: Provider + Sync + Send,
{
    let tx = execution
        .fee_estimate_multiplier(1.5)
        .send()
        .await
        .map_err(EnsureTxnError::from)?;

    TransactionWaiter::new(tx.transaction_hash, provider)
        .with_timeout(Duration::from_secs(5))
        .wait()
        .await
        .map_err(EnsureTxnError::from)?;

    Ok(tx.transaction_hash)
}
