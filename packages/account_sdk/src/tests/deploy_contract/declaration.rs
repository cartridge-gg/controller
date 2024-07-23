use std::sync::Arc;

use starknet::{
    accounts::ConnectedAccount,
    core::types::contract::{CompiledClass, SierraClass},
    providers::{JsonRpcClient, Provider},
};

use super::pending::PendingDeclaration;

pub const SIERRA_STR: &str = include_str!("../../../compiled/controller.contract_class.json");
// We can store only the class_hash and thus te casm_str would not be needed but for now it is
pub const CASM_STR: &str =
    include_str!("../../../compiled/controller.compiled_contract_class.json");

pub const ERC_20_SIERRA_STR: &str = include_str!("../../../compiled/erc20.contract_class.json");
pub const ERC_20_CASM_STR: &str =
    include_str!("../../../compiled/erc20.compiled_contract_class.json");

pub struct AccountDeclaration<'a, T> {
    contract_artifact: SierraClass,
    compiled_class: CompiledClass,
    client: &'a JsonRpcClient<T>,
}

impl<'a, T> AccountDeclaration<'a, T> {
    pub fn new(
        contract_artifact: SierraClass,
        compiled_class: CompiledClass,
        client: &'a JsonRpcClient<T>,
    ) -> Self
    where
        T: Send + Sync,
        &'a JsonRpcClient<T>: Provider,
    {
        Self {
            contract_artifact,
            compiled_class,
            client,
        }
    }
    pub fn cartridge_account(client: &'a JsonRpcClient<T>) -> Self
    where
        T: Send + Sync,
        &'a JsonRpcClient<T>: Provider,
    {
        Self::new(
            serde_json::from_str(SIERRA_STR).unwrap(),
            serde_json::from_str(CASM_STR).unwrap(),
            client,
        )
    }
    pub fn erc_20(client: &'a JsonRpcClient<T>) -> Self
    where
        T: Send + Sync,
        &'a JsonRpcClient<T>: Provider,
    {
        Self::new(
            serde_json::from_str(ERC_20_SIERRA_STR).unwrap(),
            serde_json::from_str(ERC_20_CASM_STR).unwrap(),
            client,
        )
    }
}

impl<'a, T> AccountDeclaration<'a, T> {
    pub async fn declare(
        self,
        account: &(impl ConnectedAccount + Send + Sync),
    ) -> Result<PendingDeclaration<'a, T>, String>
    where
        T: Send + Sync,
        &'a JsonRpcClient<T>: Provider,
    {
        let casm_class_hash = self
            .compiled_class
            .class_hash()
            .map_err(|e| e.to_string())?;

        // We need to flatten the ABI into a string first
        let flattened_class = self
            .contract_artifact
            .clone()
            .flatten()
            .map_err(|e| e.to_string())?;

        let declaration_result = account
            .declare_v2(Arc::new(flattened_class), casm_class_hash)
            .send()
            .await
            .unwrap();

        Ok(PendingDeclaration::from((declaration_result, self.client)))
    }
}
