use async_trait::async_trait;
use cainome_cairo_serde::CairoSerde;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::{
        types::{BlockId, BlockTag, Call, Felt},
        utils::NonAsciiNameError,
    },
    macros::short_string,
};
use starknet_crypto::poseidon_hash_many;

use crate::{
    abigen::controller::SessionToken,
    constants::GUARDIAN_SIGNER,
    hash::StructHashRev1,
    impl_account, impl_execution_encoder,
    provider::CartridgeJsonRpcProvider,
    signers::{HashSigner, SessionPolicyError, SignError, Signer},
};

use super::{hash::Session, policy::Policy, AccountHashAndCallsSigner, TypedData};

pub struct SessionAccount {
    provider: CartridgeJsonRpcProvider,
    signer: Signer,
    address: Felt,
    chain_id: Felt,
    block_id: BlockId,
    pub session: Session,
    pub session_authorization: Vec<Felt>,
}

impl SessionAccount {
    pub fn new(
        provider: CartridgeJsonRpcProvider,
        signer: Signer,
        address: Felt,
        chain_id: Felt,
        session_authorization: Vec<Felt>,
        session: Session,
    ) -> Self {
        Self {
            provider,
            signer,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Pending),
            session_authorization,
            session,
        }
    }

    pub fn new_as_registered(
        provider: CartridgeJsonRpcProvider,
        signer: Signer,
        address: Felt,
        chain_id: Felt,
        owner_guid: Felt,
        session: Session,
    ) -> Self {
        Self::new(
            provider,
            signer,
            address,
            chain_id,
            vec![short_string!("authorization-by-registered"), owner_guid],
            session,
        )
    }

    pub async fn sign_typed_data(
        &self,
        typed_data: &[TypedData],
    ) -> Result<SessionToken, SignError> {
        let hash = poseidon_hash_many(
            typed_data
                .iter()
                .map(StructHashRev1::get_struct_hash_rev_1)
                .collect::<Vec<_>>()
                .iter(),
        );
        self.sign(
            hash,
            &typed_data.iter().map(Policy::from).collect::<Vec<_>>(),
        )
        .await
    }

    fn generate_proofs(&self, policies: &[Policy]) -> Result<Vec<Vec<Felt>>, SignError> {
        let mut proofs = Vec::new();

        for policy in policies {
            let Some(proof) = self.session.clone().single_proof(policy) else {
                return match policy {
                    Policy::Call(method) => Err(SignError::SessionPolicyNotAllowed(
                        SessionPolicyError::MethodNotAllowed {
                            selector: method.selector,
                            contract_address: method.contract_address,
                        },
                    )),
                    Policy::TypedData(typed_data_policy) => {
                        Err(SignError::SessionPolicyNotAllowed(
                            SessionPolicyError::TypedDataNotAllowed {
                                scope_hash: typed_data_policy.scope_hash,
                            },
                        ))
                    }
                };
            };

            proofs.push(proof);
        }

        Ok(proofs)
    }

    async fn sign(&self, hash: Felt, policies: &[Policy]) -> Result<SessionToken, SignError> {
        let hash = self.message_hash(hash)?;
        let proofs = if self.session.is_wildcard() {
            vec![]
        } else {
            self.generate_proofs(policies)?
        };

        Ok(SessionToken {
            session: self.session.clone().into(),
            cache_authorization: true,
            session_authorization: self.session_authorization.clone(),
            session_signature: self.signer.sign(&hash).await?,
            guardian_signature: GUARDIAN_SIGNER.sign(&hash).await?,
            proofs,
        })
    }

    fn session_magic() -> Felt {
        short_string!("session-token")
    }

    fn message_hash(&self, hash: Felt) -> Result<Felt, NonAsciiNameError> {
        self.session.message_hash(hash, self.chain_id, self.address)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl AccountHashAndCallsSigner for SessionAccount {
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        let result = self
            .sign(hash, &calls.iter().map(Policy::from).collect::<Vec<_>>())
            .await?;
        let sig = [
            vec![Self::session_magic()],
            SessionToken::cairo_serialize(&result),
        ]
        .concat();
        Ok(sig)
    }
}

impl_execution_encoder!(SessionAccount);
impl_account!(SessionAccount, |_, _| false);

impl ConnectedAccount for SessionAccount {
    type Provider = CartridgeJsonRpcProvider;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
