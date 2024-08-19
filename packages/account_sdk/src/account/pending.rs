use starknet::{core::types::Felt, providers::Provider};

use crate::transaction_waiter::TransactionWaiter;

pub struct PendingTransaction<'a, P, T>
where
    &'a P: Provider + Send + Sync,
{
    transaction_result: T,
    transaction_hash: Felt,
    client: &'a P,
}

impl<'a, P, T> PendingTransaction<'a, P, T>
where
    &'a P: Provider + Send + Sync,
{
    pub fn new(transaction_result: T, transaction_hash: Felt, client: &'a P) -> Self {
        PendingTransaction {
            transaction_result,
            transaction_hash,
            client,
        }
    }
    pub async fn wait_for_completion(self) -> T {
        TransactionWaiter::new(self.transaction_hash, &self.client)
            .wait()
            .await
            .unwrap();
        self.transaction_result
    }
}
