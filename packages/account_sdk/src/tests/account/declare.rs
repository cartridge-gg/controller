use std::sync::Arc;

use starknet::{
    accounts::ConnectedAccount,
    core::types::{contract::SierraClass, DeclareTransactionResult},
    providers::Provider,
};
use starknet_crypto::Felt;

use crate::constants::{ACCOUNT_COMPILED_CLASS_HASH, ERC_20_COMPILED_CLASS_HASH};
use crate::provider::CartridgeJsonRpcProvider;

use super::pending::PendingTransaction;

pub const SIERRA_STR: &str = include_str!("../../../compiled/controller.contract_class.json");
pub const ERC_20_SIERRA_STR: &str = include_str!("../../../compiled/erc20.contract_class.json");

pub struct AccountDeclaration<'a> {
    contract_artifact: SierraClass,
    compiled_class_hash: Felt,
    client: &'a CartridgeJsonRpcProvider,
}

impl<'a> AccountDeclaration<'a> {
    pub fn new(
        contract_artifact: SierraClass,
        compiled_class_hash: Felt,
        client: &'a CartridgeJsonRpcProvider,
    ) -> Self
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        Self {
            contract_artifact,
            compiled_class_hash,
            client,
        }
    }
    pub fn cartridge_account(client: &'a CartridgeJsonRpcProvider) -> Self
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        Self::new(
            serde_json::from_str(SIERRA_STR).unwrap(),
            ACCOUNT_COMPILED_CLASS_HASH,
            client,
        )
    }
    pub fn erc_20(client: &'a CartridgeJsonRpcProvider) -> Self
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        Self::new(
            serde_json::from_str(ERC_20_SIERRA_STR).unwrap(),
            ERC_20_COMPILED_CLASS_HASH,
            client,
        )
    }
}

impl<'a> AccountDeclaration<'a> {
    pub async fn declare(
        self,
        account: &(impl ConnectedAccount + Send + Sync),
    ) -> Result<PendingDeclaration<'a>, String>
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        // We need to flatten the ABI into a string first
        let flattened_class = self
            .contract_artifact
            .clone()
            .flatten()
            .map_err(|e| e.to_string())?;

        let declaration_result = account
            .declare_v2(Arc::new(flattened_class), self.compiled_class_hash)
            .fee_estimate_multiplier(1.5)
            .send()
            .await
            .unwrap();

        Ok(PendingDeclaration::from((declaration_result, self.client)))
    }
}

pub type PendingDeclaration<'a> =
    PendingTransaction<'a, CartridgeJsonRpcProvider, DeclareTransactionResult>;

impl<'a> From<(DeclareTransactionResult, &'a CartridgeJsonRpcProvider)> for PendingDeclaration<'a>
where
    &'a CartridgeJsonRpcProvider: Provider,
{
    fn from((result, client): (DeclareTransactionResult, &'a CartridgeJsonRpcProvider)) -> Self {
        let transaction_hash = result.transaction_hash;
        Self::new(result, transaction_hash, client)
    }
}
