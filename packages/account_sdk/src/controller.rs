use crate::abigen::controller::{OutsideExecution, Signer, SignerSignature, StarknetSigner};
use crate::account::outside_execution::OutsideExecutionAccount;
use crate::account::session::hash::{AllowedMethod, Session};
use crate::account::session::SessionAccount;
use crate::account::SpecificAccount;
use crate::account::{AccountHashAndCallsSigner, CallEncoder};
use crate::hash::MessageHashRev1;
use crate::provider::{CartridgeProvider, CartridgeProviderError};
use crate::signers::{DeviceError, SignerTrait};
use crate::storage::{Credentials, Selectors, SessionMetadata, StorageBackend, StorageValue};
use crate::{
    abigen::{self},
    account::AccountHashSigner,
    signers::{HashSigner, SignError},
};
use crate::{impl_account, OriginProvider};
use async_trait::async_trait;
use cainome::cairo_serde::{self, CairoSerde, NonZero};
use starknet::accounts::{AccountError, AccountFactoryError, ExecutionV1};
use starknet::core::types::{BlockTag, Call, FeeEstimate, InvokeTransactionResult};
use starknet::core::utils::CairoShortStringToFeltError;
use starknet::signers::SignerInteractivityContext;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
    signers::{SigningKey, VerifyingKey},
};

pub trait Backend: StorageBackend + OriginProvider {}

#[derive(Debug, thiserror::Error)]
pub enum ControllerError {
    #[error(transparent)]
    DeviceError(#[from] DeviceError),

    #[error(transparent)]
    SignError(#[from] SignError),

    #[error(transparent)]
    StorageError(#[from] crate::storage::StorageError),

    #[error(transparent)]
    ProviderError(#[from] starknet::providers::ProviderError),

    #[error(transparent)]
    AccountError(#[from] AccountError<SignError>),

    #[error(transparent)]
    AccountFactoryError(#[from] AccountFactoryError<SignError>),

    #[error(transparent)]
    CartridgeProviderError(#[from] CartridgeProviderError),

    #[error("Origin error: {0}")]
    OriginError(String),

    #[error(transparent)]
    CairoSerde(#[from] cairo_serde::Error),

    #[error(transparent)]
    CairoShortStringToFeltEror(#[from] CairoShortStringToFeltError),
}

pub struct Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    app_id: String,
    pub username: String,
    pub address: Felt,
    pub chain_id: Felt,
    block_id: BlockId,
    pub provider: P,
    pub owner: S,
    pub guardian: SigningKey,
    pub contract: Option<Box<abigen::controller::Controller<Self>>>,
    backend: B,
}

impl<P, S, B> Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        app_id: String,
        username: String,
        provider: P,
        owner: S,
        guardian: SigningKey,
        address: Felt,
        chain_id: Felt,
        backend: B,
    ) -> Self {
        Self {
            app_id,
            username,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Pending),
            provider,
            owner,
            guardian,
            contract: None, //abigen::controller::Controller::new(address, account),
            backend,
        }
    }

    pub fn owner_guid(&self) -> Felt {
        self.owner.signer().guid()
    }

    pub async fn create_session(
        &mut self,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<(Vec<Felt>, Felt), ControllerError> {
        let signer = SigningKey::from_random();
        let session = Session::new(allowed_methods, expires_at, &signer.signer())?;
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id, self.address);
        let authorization = self.sign_hash(hash).await?;
        self.backend.set(
            &Selectors::session(&self.address, &self.app_id, &self.chain_id),
            &StorageValue::Session(SessionMetadata {
                session,
                max_fee: None,
                credentials: Credentials {
                    authorization: authorization.clone(),
                    private_key: signer.secret_scalar(),
                },
            }),
        )?;

        Ok((authorization, signer.secret_scalar()))
    }

    pub async fn register_session(
        &mut self,
        methods: Vec<AllowedMethod>,
        expires_at: u64,
        public_key: Felt,
    ) -> Result<Felt, ControllerError> {
        let pubkey = VerifyingKey::from_scalar(public_key);
        let signer = Signer::Starknet(StarknetSigner {
            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
        });

        let session = Session::new(methods, expires_at, &signer)?;
        let register_execution = self
            .contract
            .as_ref()
            .unwrap()
            .register_session(&session.raw(), &self.owner_guid());

        let txn = register_execution
            // FIXME: est fee is not accurate as it does not account for validation cost, so set to some high multiple for now
            .fee_estimate_multiplier(5.0)
            .send()
            .await
            .map_err(ControllerError::AccountError)?;

        Ok(txn.transaction_hash)
    }

    pub async fn execute_from_outside(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<Felt, ControllerError> {
        let signed = self
            .sign_outside_execution(outside_execution.clone())
            .await?;

        let res = self
            .provider()
            .add_execute_outside_transaction(outside_execution, self.address, signed.signature)
            .await
            .map_err(ControllerError::CartridgeProviderError)?;

        Ok(res.result.transaction_hash)
    }

    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<Call>,
        fee_multiplier: Option<f64>,
    ) -> Result<FeeEstimate, ControllerError> {
        let multiplier = fee_multiplier.unwrap_or(1.0);
        self.execute_v1(calls)
            .fee_estimate_multiplier(multiplier)
            .estimate_fee()
            .await
            .map_err(ControllerError::AccountError)
    }

    pub async fn execute(
        &self,
        calls: Vec<Call>,
        nonce: Felt,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        self.execute_v1(calls)
            .max_fee(max_fee)
            .nonce(nonce)
            .send()
            .await
            .map_err(ControllerError::AccountError)
    }

    pub fn session_metadata(&self) -> Option<SessionMetadata> {
        let key = Selectors::session(&self.address, &self.app_id, &self.chain_id);

        self.backend
            .get(&key)
            .ok()
            .flatten()
            .map(|value| match value {
                StorageValue::Session(metadata) => metadata,
            })
    }

    pub fn session_account(&self, calls: &[Call]) -> Option<SessionAccount<P, SigningKey>> {
        // Check if there's a valid session stored
        let metadata = self.session_metadata()?;

        // Check if all calls are allowed by the session
        if calls
            .iter()
            .all(|call| metadata.session.is_call_allowed(call))
        {
            // Use SessionAccount if all calls are allowed
            let session_signer = SigningKey::from_secret_scalar(metadata.credentials.private_key);
            let session_account = SessionAccount::new(
                self.provider.clone(),
                session_signer,
                SigningKey::from_random(),
                self.address,
                self.chain_id,
                metadata.credentials.authorization,
                metadata.session,
            );
            return Some(session_account);
        }

        // Use OwnerAccount if no valid session or not all calls are allowed
        None
    }

    pub async fn delegate_account(&self) -> Result<Felt, ControllerError> {
        self.contract
            .as_ref()
            .unwrap()
            .delegate_account()
            .call()
            .await
            .map(|address| address.into())
            .map_err(ControllerError::CairoSerde)
    }

    pub fn set_delegate_account(&self, delegate_address: Felt) -> ExecutionV1<Self> {
        self.contract
            .as_ref()
            .unwrap()
            .set_delegate_account(&delegate_address.into())
    }

    pub fn set_signer(&mut self, new_owner: S) {
        self.owner = new_owner;
    }
}

impl_account!(Controller<P: CartridgeProvider, S: HashSigner, B: Backend>, |account: &Controller<P, S, B>, context| {
    if let SignerInteractivityContext::Execution { calls } = context {
        account.session_account(calls).is_none()
    } else {
        true
    }
});

impl<P, S, B> ConnectedAccount for Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, B> AccountHashAndCallsSigner for Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        match self.session_account(calls) {
            Some(session_account) => session_account.sign_hash_and_calls(hash, calls).await,
            _ => self.sign_hash_and_calls(hash, calls).await,
        }
    }
}

impl<P, S, B> ExecutionEncoder for Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        CallEncoder::encode_calls(calls)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, B> AccountHashSigner for Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        let owner_signature = self.owner.sign(&hash).await?;
        let guardian_signature = HashSigner::sign(&self.guardian, &hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![
            owner_signature,
            guardian_signature,
        ]))
    }
}

impl<P, S, B> SpecificAccount for Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    fn address(&self) -> Felt {
        self.address
    }

    fn chain_id(&self) -> Felt {
        self.chain_id
    }
}
