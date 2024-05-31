use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{
        Account, Call, ConnectedAccount, Declaration, Execution, ExecutionEncoder,
        LegacyDeclaration, RawDeclaration, RawExecution, RawLegacyDeclaration,
    },
    core::types::{
        contract::legacy::LegacyContractClass, BlockId, FieldElement, FlattenedSierraClass,
    },
    providers::Provider,
};
use std::sync::Arc;

use crate::{
    abigen::cartridge_account::SignerSignature,
    signers::{HashSigner, SignError},
};

use super::cartridge::CartridgeAccount;

#[derive(Clone, Debug)]
pub struct CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    pub(crate) account: CartridgeAccount<P, S>,
    pub(crate) guardian: G,
}

impl<P, S, G> CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    pub fn new(
        provider: P,
        signer: S,
        guardian: G,
        address: FieldElement,
        chain_id: FieldElement,
    ) -> Self {
        CartridgeGuardianAccount {
            account: CartridgeAccount::new(provider, signer, address, chain_id),
            guardian,
        }
    }
    pub fn from_account(account: CartridgeAccount<P, S>, guardian: G) -> Self {
        Self { account, guardian }
    }
    pub async fn sign_hash(&self, hash: FieldElement) -> Result<Vec<FieldElement>, SignError> {
        let owner_signature = self.account.signer.sign(&hash).await?;
        let guardian_signature = self.guardian.sign(&hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![
            owner_signature,
            guardian_signature,
        ]))
    }
}

impl<P, S, G> ExecutionEncoder for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<FieldElement> {
        self.account.encode_calls(calls)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G> Account for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    type SignError = SignError;

    fn address(&self) -> FieldElement {
        self.account.address()
    }

    fn chain_id(&self) -> FieldElement {
        self.account.chain_id()
    }

    async fn sign_execution(
        &self,
        execution: &RawExecution,
        query_only: bool,
    ) -> Result<Vec<FieldElement>, Self::SignError> {
        let tx_hash = execution.transaction_hash(self.chain_id(), self.address(), query_only, self);
        self.sign_hash(tx_hash).await
    }

    async fn sign_declaration(
        &self,
        _declaration: &RawDeclaration,
        _query_only: bool,
    ) -> Result<Vec<FieldElement>, Self::SignError> {
        unimplemented!("sign_declaration")
    }

    async fn sign_legacy_declaration(
        &self,
        _legacy_declaration: &RawLegacyDeclaration,
        _query_only: bool,
    ) -> Result<Vec<FieldElement>, Self::SignError> {
        unimplemented!("sign_legacy_declaration")
    }

    fn execute(&self, calls: Vec<Call>) -> Execution<Self> {
        Execution::new(calls, self)
    }

    fn declare(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: FieldElement,
    ) -> Declaration<Self> {
        Declaration::new(contract_class, compiled_class_hash, self)
    }

    fn declare_legacy(&self, contract_class: Arc<LegacyContractClass>) -> LegacyDeclaration<Self> {
        LegacyDeclaration::new(contract_class, self)
    }
}

impl<P, S, G> ConnectedAccount for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        self.account.provider()
    }

    fn block_id(&self) -> BlockId {
        self.account.block_id()
    }
}
