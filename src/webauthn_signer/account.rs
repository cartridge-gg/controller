use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use serde::Serialize;
use starknet::{
    accounts::{
        Account, Call, ConnectedAccount, Declaration, Execution, ExecutionEncoder,
        LegacyDeclaration, RawDeclaration, RawExecution, RawLegacyDeclaration,
    },
    core::{
        crypto::EcdsaSignError,
        types::{
            contract::legacy::LegacyContractClass, BlockId, BlockTag, FieldElement,
            FlattenedSierraClass,
        },
    },
    providers::Provider,
};
use std::sync::Arc;

use crate::felt_ser::to_felts;

use super::{cairo_args::VerifyWebauthnSignerArgs, P256r1Signer};
use crate::abigen::account::WebauthnSignature;

pub struct WebauthnAccount<P>
where
    P: Provider + Send,
{
    provider: P,
    // Later the struct will be generic over the signer type
    // and will support "external" signers
    signer: P256r1Signer,
    address: FieldElement,
    chain_id: FieldElement,
    block_id: BlockId,
    origin: String,
}
impl<P> WebauthnAccount<P>
where
    P: Provider + Send,
{
    pub fn new(
        provider: P,
        signer: P256r1Signer,
        address: FieldElement,
        chain_id: FieldElement,
    ) -> Self {
        Self {
            provider,
            signer,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Latest),
            // Not security critical, but should be agreed upon
            origin: "starknet".to_string(),
        }
    }
}

//starknet::accounts::Call really should implement serde::Serialize, at least as a crate feature
#[derive(Debug, Clone, Serialize)]
struct SerializableCall<'a> {
    pub to: &'a FieldElement,
    pub selector: &'a FieldElement,
    pub calldata: &'a Vec<FieldElement>,
}
impl<'a> From<&'a Call> for SerializableCall<'a> {
    fn from(call: &'a Call) -> Self {
        Self {
            to: &call.to,
            selector: &call.selector,
            calldata: &call.calldata,
        }
    }
}

impl<P> ExecutionEncoder for WebauthnAccount<P>
where
    P: Provider + Send,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<FieldElement> {
        to_felts(&calls.iter().map(SerializableCall::from).collect::<Vec<_>>())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum SignError {
    #[error("Signer error: {0}")]
    Signer(EcdsaSignError),
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P> Account for WebauthnAccount<P>
where
    P: Provider + Send + Sync,
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
        let challenge = tx_hash.to_bytes_be().to_vec();
        let assertion = self.signer.sign(&challenge);

        let args =
            VerifyWebauthnSignerArgs::from_response(self.origin.clone(), challenge, assertion);

        let result = WebauthnSignature {
            signature_type: super::WEBAUTHN_SIGNATURE_TYPE,
            r: args.r.into(),
            s: args.s.into(),
            type_offset: args.type_offset,
            challenge_offset: args.challenge_offset,
            origin_offset: args.origin_offset,
            client_data_json: args.client_data_json,
            origin: args.origin,
            authenticator_data: args.authenticator_data,
        };
        Ok(WebauthnSignature::cairo_serialize(&result))
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

impl<P> ConnectedAccount for WebauthnAccount<P>
where
    P: Provider + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
