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
    macros::short_string,
    providers::Provider,
};
use std::sync::Arc;

use crate::{
    abigen::controller::Call as AbigenCall,
    signers::{HashSigner, SignError},
};

use self::{
    hash::{AllowedMethod, Session},
    raw_session::RawSessionToken,
};

pub mod create;
pub mod hash;
pub mod merkle;
pub mod raw_session;

pub struct SessionAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    provider: P,
    signer: S,
    guardian: G,
    address: FieldElement,
    chain_id: FieldElement,
    block_id: BlockId,
    session_authorization: Vec<FieldElement>,
    session: Session,
}
impl<P, S, G> SessionAccount<P, S, G>
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
        session_authorization: Vec<FieldElement>,
        session: Session,
    ) -> Self {
        Self {
            provider,
            signer,
            guardian,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Latest),
            session_authorization,
            session,
        }
    }
    pub async fn sign(
        &self,
        hash: FieldElement,
        execution: &RawExecution,
    ) -> Result<RawSessionToken, SignError> {
        let methods = Self::parse_calls(execution);
        let proofs = methods
            .iter()
            .map(|m| self.session.single_proof(m))
            .collect::<Option<Vec<_>>>()
            .ok_or(SignError::SessionMethodNotAllowed)?;
        Ok(RawSessionToken {
            session: self.session.raw(),
            session_authorization: self.session_authorization.clone(),
            session_signature: self.signer.sign(&hash).await?,
            guardian_signature: self.guardian.sign(&hash).await?,
            proofs,
        })
    }
    fn session_magic() -> FieldElement {
        short_string!("session-token")
    }
    pub fn parse_calls(execution: &RawExecution) -> Vec<AllowedMethod> {
        let tx_printed = format!("{:?}", execution);
        let mut individual_calls = tx_printed.split("Call { to: FieldElement { inner: ");
        individual_calls.next(); // First one is not a call

        individual_calls
            .map(|call| {
                let mut call = call.split(" }, selector: FieldElement { inner: ");
                let to = call.next().unwrap();
                let selector = call.next().unwrap();
                let selector = selector.split(" }").next().unwrap();

                AllowedMethod {
                    contract_address: FieldElement::from_hex_be(to).unwrap(),
                    selector: FieldElement::from_hex_be(selector).unwrap(),
                }
            })
            .collect()
    }
}

impl<P, S, G> ExecutionEncoder for SessionAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<FieldElement> {
        <Vec<AbigenCall> as CairoSerde>::cairo_serialize(
            &calls
                .iter()
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
impl<P, S, G> Account for SessionAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
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
        let result = self
            .sign(
                self.session
                    .message_hash(tx_hash, self.chain_id, self.address)?,
                execution,
            )
            .await?;
        Ok([
            vec![Self::session_magic()],
            RawSessionToken::cairo_serialize(&result),
        ]
        .concat())
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

impl<P, S, G> ConnectedAccount for SessionAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
