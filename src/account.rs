use async_trait::async_trait;
use cainome::cairo_serde::{CairoSerde, ContractAddress};
use starknet::{
    accounts::{
        Account, Call, ConnectedAccount, Declaration, Execution, ExecutionEncoder,
        LegacyDeclaration, RawDeclaration, RawExecution, RawLegacyDeclaration,
    },
    core::types::{
        contract::legacy::LegacyContractClass, BlockId, BlockTag, FieldElement,
        FlattenedSierraClass,
    },
    providers::Provider,
};
use std::sync::Arc;

use crate::{
    abigen::cartridge_account::{Call as AbigenCall, SignerSignature},
    signers::{AccountSigner, SignError},
};

pub struct CartridgeAccount<P, S>
where
    P: Provider + Send,
    S: AccountSigner + Send,
{
    provider: P,
    signer: S,
    address: FieldElement,
    chain_id: FieldElement,
    block_id: BlockId,
}
impl<P, S> CartridgeAccount<P, S>
where
    P: Provider + Send,
    S: AccountSigner + Send,
{
    pub fn new(provider: P, signer: S, address: FieldElement, chain_id: FieldElement) -> Self {
        Self {
            provider,
            signer,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Latest),
        }
    }
}

impl<P, S> ExecutionEncoder for CartridgeAccount<P, S>
where
    P: Provider + Send,
    S: AccountSigner + Send,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<FieldElement> {
        <Vec<AbigenCall> as CairoSerde>::cairo_serialize(
            &calls
                .into_iter()
                .map(
                    |Call {
                         to,
                         selector,
                         calldata,
                     }| AbigenCall {
                        to: ContractAddress(*to),
                        selector: *selector,
                        calldata: calldata.clone(),
                    },
                )
                .collect(),
        )
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S> Account for CartridgeAccount<P, S>
where
    P: Provider + Send + Sync,
    S: AccountSigner + Send + Sync,
{
    type SignError = SignError;

    fn address(&self) -> FieldElement {
        self.address
    }

    fn chain_id(&self) -> FieldElement {
        self.chain_id
    }

    async fn sign_execution(
        &self,
        execution: &RawExecution,
        query_only: bool,
    ) -> Result<Vec<FieldElement>, Self::SignError> {
        let tx_hash = execution.transaction_hash(self.chain_id, self.address, query_only, self);
        let result = self.signer.sign(&tx_hash).await.ok().unwrap();
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![result]))
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

impl<P, S> ConnectedAccount for CartridgeAccount<P, S>
where
    P: Provider + Send + Sync,
    S: AccountSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}

pub struct CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: AccountSigner + Send,
    G: AccountSigner + Send,
{
    account: CartridgeAccount<P, S>,
    guardian: G,
}

impl<P, S, G> CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: AccountSigner + Send,
    G: AccountSigner + Send,
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
}

impl<P, S, G> ExecutionEncoder for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: AccountSigner + Send,
    G: AccountSigner + Send,
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
    S: AccountSigner + Send + Sync,
    G: AccountSigner + Send + Sync,
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
        let owner_signature = self.account.signer.sign(&tx_hash).await?;
        let guardian_signature = self.guardian.sign(&tx_hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![
            owner_signature,
            guardian_signature,
        ]))
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
    S: AccountSigner + Send + Sync,
    G: AccountSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.account.provider()
    }

    fn block_id(&self) -> BlockId {
        self.account.block_id()
    }
}
