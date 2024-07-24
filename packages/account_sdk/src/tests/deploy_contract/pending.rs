use starknet::{
    core::types::{DeclareTransactionResult, Felt},
    providers::{JsonRpcClient, Provider},
};

use crate::transaction_waiter::TransactionWaiter;

use super::deployment::DeployResult;

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

pub type PendingDeclaration<'a, T> =
    PendingTransaction<'a, JsonRpcClient<T>, DeclareTransactionResult>;

impl<'a, T> From<(DeclareTransactionResult, &'a JsonRpcClient<T>)> for PendingDeclaration<'a, T>
where
    T: Send + Sync,
    &'a JsonRpcClient<T>: Provider,
{
    fn from((result, client): (DeclareTransactionResult, &'a JsonRpcClient<T>)) -> Self {
        let transaction_hash = result.transaction_hash;
        Self::new(result, transaction_hash, client)
    }
}

pub type PendingDeployment<'a, T> = PendingTransaction<'a, JsonRpcClient<T>, DeployResult>;

impl<'a, T> From<(DeployResult, &'a JsonRpcClient<T>)> for PendingDeployment<'a, T>
where
    T: Send + Sync,
    &'a JsonRpcClient<T>: Provider,
{
    fn from((result, client): (DeployResult, &'a JsonRpcClient<T>)) -> Self {
        let transaction_hash = result.transaction_hash;
        Self::new(result, transaction_hash, client)
    }
}
