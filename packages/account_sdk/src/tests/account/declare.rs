use std::sync::Arc;

use starknet::{
    accounts::{AccountError, ConnectedAccount},
    core::types::{contract::SierraClass, DeclareTransactionResult, Felt},
    macros::felt,
    providers::Provider,
};
use thiserror::Error;

use crate::artifacts::{Version, CONTROLLERS};
use crate::provider::CartridgeJsonRpcProvider;

use super::pending::PendingTransaction;

pub const ERC_20_COMPILED_CLASS_HASH: Felt =
    felt!("0x732654ca6baa90ff202d2fcc35fb39766eb34842a7e5ac6dbf7714af71f1dab");
pub const ERC_20_SIERRA_STR: &str =
    include_str!("../../../artifacts/classes/erc20.contract_class.json");
pub const GARAGA_COMPILED_CLASS_HASH: Felt =
    felt!("0x3d12d63bd7c309c264802ea127085b8ccd0b25e256311352c9b975c6e9977f3");
pub const GARAGA_SIERRA_STR: &str =
    include_str!("../../../artifacts/classes/garaga.contract_class.json");

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
    pub fn garaga(client: &'a CartridgeJsonRpcProvider) -> Self
    where
        &'a CartridgeJsonRpcProvider: Provider,
    {
        Self::new(
            serde_json::from_str(GARAGA_SIERRA_STR).unwrap(),
            GARAGA_COMPILED_CLASS_HASH,
            client,
        )
    }
}

#[derive(Debug, Error)]
pub enum DeclarationError<S> {
    #[error("Failed to flatten Sierra class: {0}")]
    Flattening(String),
    #[error(transparent)]
    AccountError(AccountError<S>),
}

impl<'a> AccountDeclaration<'a> {
    pub async fn declare<'acc, Acc>(
        self,
        account: &'acc Acc,
    ) -> Result<PendingDeclaration<'a>, DeclarationError<Acc::SignError>>
    where
        Acc: ConnectedAccount + Send + Sync,
    {
        // We need to flatten the ABI into a string first
        let flattened_class = self
            .contract_artifact
            .clone()
            .flatten()
            .map_err(|e| DeclarationError::Flattening(e.to_string()))?;

        let declaration_result = account
            .declare_v3(Arc::new(flattened_class), self.compiled_class_hash)
            .gas_estimate_multiplier(1.5)
            .send()
            .await
            .map_err(DeclarationError::AccountError)?;

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
