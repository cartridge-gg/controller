use std::sync::Arc;

use starknet::{
    accounts::ConnectedAccount,
    core::types::{contract::SierraClass, DeclareTransactionResult},
    macros::felt,
    providers::Provider,
};
use starknet_crypto::Felt;

use crate::artifacts::{Version, CONTROLLERS};
use crate::provider::CartridgeJsonRpcProvider;

use super::pending::PendingTransaction;

pub const ERC_20_COMPILED_CLASS_HASH: Felt =
    felt!("0x732654ca6baa90ff202d2fcc35fb39766eb34842a7e5ac6dbf7714af71f1dab");
pub const ERC_20_SIERRA_STR: &str =
    include_str!("../../../artifacts/classes/erc20.contract_class.json");

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
    pub fn cartridge_account(client: &'a CartridgeJsonRpcProvider, version: Version) -> Self
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        let contract_class = CONTROLLERS[&version];

        let contract_artifact: SierraClass = serde_json::from_str(contract_class.content).unwrap();

        Self::new(contract_artifact, contract_class.casm_hash, client)
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
    ) -> Result<PendingDeclaration<'a>, String> {
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
