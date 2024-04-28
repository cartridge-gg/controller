use async_trait::async_trait;
use cainome::cairo_serde::{CairoSerde, ContractAddress};
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

use crate::abigen::cartridge_account::{Call as AbigenCall, SignerSignature, WebauthnAssertion};

// use super::{cairo_args::VerifyWebauthnSignerArgs, signers::device::DeviceError};

use crate::webauthn_signer::signers::Signer;

use super::json_helper::find_value_index_length;

pub struct WebauthnAccount<P, S>
where
    P: Provider + Send,
    S: Signer + Send,
{
    provider: P,
    signer: S,
    address: FieldElement,
    chain_id: FieldElement,
    block_id: BlockId,
}
impl<P, S> WebauthnAccount<P, S>
where
    P: Provider + Send,
    S: Signer + Send,
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
    pub async fn execution_signature(
        &self,
        execution: &RawExecution,
        query_only: bool,
    ) -> Result<SignerSignature, SignError> {
        let tx_hash = execution.transaction_hash(self.chain_id, self.address, query_only, self);
        let mut challenge = tx_hash.to_bytes_be().to_vec();

        // Cairo-1 sha256
        challenge.push(1);
        let assertion = self.signer.sign(&challenge).await?;

        let (type_offset, _) =
            find_value_index_length(&assertion.client_data_json, "type").unwrap();
        let (challenge_offset, challenge_length) =
            find_value_index_length(&assertion.client_data_json, "challenge").unwrap();
        let (origin_offset, origin_length) =
            find_value_index_length(&assertion.client_data_json, "origin").unwrap();

        let transformed_assertion = WebauthnAssertion {
            signature: assertion.signature,
            type_offset: type_offset as u32,
            challenge_offset: challenge_offset as u32,
            challenge_length: challenge_length as u32,
            origin_offset: origin_offset as u32,
            origin_length: origin_length as u32,
            client_data_json: assertion.client_data_json.into_bytes(),
            authenticator_data: assertion.authenticator_data.into(),
        };
        Ok(SignerSignature::Webauthn((
            self.signer.account_signer(),
            transformed_assertion,
        )))
    }
}

impl<P, S> ExecutionEncoder for WebauthnAccount<P, S>
where
    P: Provider + Send,
    S: Signer + Send,
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

#[derive(Debug, thiserror::Error)]
pub enum SignError {
    #[error("Signer error: {0}")]
    Signer(EcdsaSignError),
    // #[error("Device error: {0}")]
    // Device(DeviceError),
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S> Account for WebauthnAccount<P, S>
where
    P: Provider + Send + Sync,
    S: Signer + Send + Sync,
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
        let result = self.execution_signature(execution, query_only).await?;
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

impl<P, S> ConnectedAccount for WebauthnAccount<P, S>
where
    P: Provider + Send + Sync,
    S: Signer + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
