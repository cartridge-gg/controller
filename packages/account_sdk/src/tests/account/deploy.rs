use starknet::{
    accounts::SingleOwnerAccount,
    contract::ContractFactory,
    core::types::{Felt, InvokeTransactionResult},
    providers::Provider,
    signers::Signer,
};

use crate::provider::CartridgeJsonRpcProvider;

use super::{pending::PendingTransaction, UDC_ADDRESS};

pub struct AccountDeployment<'a> {
    client: &'a CartridgeJsonRpcProvider,
}

impl<'a> AccountDeployment<'a> {
    pub fn new(client: &'a CartridgeJsonRpcProvider) -> Self
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        AccountDeployment { client }
    }
}

#[derive(Debug, Clone)]
pub struct DeployResult {
    pub deployed_address: Felt,
    pub transaction_hash: Felt,
}

impl<'a> AccountDeployment<'a> {
    pub async fn deploy<P, S>(
        self,
        constructor_calldata: Vec<Felt>,
        salt: Felt,
        account: &SingleOwnerAccount<P, S>,
        class_hash: Felt,
    ) -> Result<PendingDeployment<'a>, String>
    where
        P: Provider + Send + Sync,
        S: Signer + Send + Sync,
        &'a CartridgeJsonRpcProvider: Provider,
    {
        let contract_factory = ContractFactory::new_with_udc(class_hash, account, *UDC_ADDRESS);

        let deployment = contract_factory.deploy_v1(constructor_calldata, salt, false);
        let deployed_address = deployment.deployed_address();
        let InvokeTransactionResult { transaction_hash } =
            deployment.send().await.expect("Unable to deploy contract");

        let result = DeployResult {
            deployed_address,
            transaction_hash,
        };

        Ok(PendingDeployment::from((result, self.client)))
    }
}

pub type PendingDeployment<'a> = PendingTransaction<'a, CartridgeJsonRpcProvider, DeployResult>;

impl<'a> From<(DeployResult, &'a CartridgeJsonRpcProvider)> for PendingDeployment<'a>
where
    &'a CartridgeJsonRpcProvider: Provider,
{
    fn from((result, client): (DeployResult, &'a CartridgeJsonRpcProvider)) -> Self {
        let transaction_hash = result.transaction_hash;
        Self::new(result, transaction_hash, client)
    }
}
