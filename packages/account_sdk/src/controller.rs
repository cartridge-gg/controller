use crate::abigen::controller::{OutsideExecution, Signer};
use crate::account::outside_execution::OutsideExecutionAccount;
use crate::account::session::hash::{AllowedMethod, Session};
use crate::account::session::SessionAccount;
use crate::account::AccountHashAndCallsSigner;
use crate::account::SpecificAccount;
use crate::constants::ACCOUNT_CLASS_HASH;
use crate::factory::ControllerFactory;
use crate::hash::MessageHashRev1;
use crate::provider::{CartridgeProvider, CartridgeProviderError};
use crate::signers::DeviceError;
use crate::storage::{Credentials, Selectors, SessionMetadata, StorageBackend, StorageValue};
use crate::{
    abigen::{self},
    account::{AccountHashSigner, OwnerAccount},
    signers::{HashSigner, SignError},
};
use crate::{impl_account, OriginProvider};
use async_trait::async_trait;
use cainome::cairo_serde::{self, CairoSerde};
use starknet::accounts::{
    AccountDeploymentV1, AccountError, AccountFactory, AccountFactoryError, ExecutionV1,
};
use starknet::core::types::{Call, FeeEstimate, InvokeTransactionResult};
use starknet::core::utils::{cairo_short_string_to_felt, CairoShortStringToFeltError};
use starknet::signers::SignerInteractivityContext;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
    signers::SigningKey,
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

pub struct Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend,
{
    app_id: String,
    pub username: String,
    salt: Felt,
    pub provider: P,
    pub(crate) account: OwnerAccount<P, S, G>,
    pub(crate) contract: abigen::controller::Controller<OwnerAccount<P, S, G>>,
    pub factory: ControllerFactory<OwnerAccount<P, S, G>, P>,
    backend: B,
}

impl<P, S, G, B> Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        app_id: String,
        username: String,
        provider: P,
        signer: S,
        guardian: G,
        address: Felt,
        chain_id: Felt,
        backend: B,
    ) -> Self {
        let account = OwnerAccount::new(provider.clone(), signer, guardian, address, chain_id);
        let salt = cairo_short_string_to_felt(&username).unwrap();

        let mut calldata = Signer::cairo_serialize(&account.signer.signer());
        calldata.push(Felt::ONE); // no guardian
        let factory = ControllerFactory::new(
            ACCOUNT_CLASS_HASH,
            account.chain_id,
            calldata,
            account.clone(),
            provider.clone(),
        );

        Self {
            app_id,
            username,
            salt,
            provider,
            account: account.clone(),
            contract: abigen::controller::Controller::new(address, account),
            factory,
            backend,
        }
    }

    pub fn deploy(&self) -> AccountDeploymentV1<ControllerFactory<OwnerAccount<P, S, G>, P>> {
        self.factory.deploy_v1(self.salt)
    }

    pub async fn create_session(
        &mut self,
        methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<(Vec<Felt>, Felt), ControllerError> {
        let signer = SigningKey::from_random();
        let session = Session::new(methods, expires_at, &signer.signer())?;
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.account.chain_id, self.account.address);
        let authorization = self.account.sign_hash(hash).await?;
        self.backend.set(
            &Selectors::session(&self.account.address, &self.app_id, &self.account.chain_id),
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

    pub async fn execute_from_outside(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<Felt, ControllerError> {
        let signed = self
            .sign_outside_execution(outside_execution.clone())
            .await?;

        let res = self
            .provider()
            .add_execute_outside_transaction(
                outside_execution,
                self.account.address,
                signed.signature,
            )
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
        let key = Selectors::session(&self.account.address, &self.app_id, &self.account.chain_id);

        self.backend
            .get(&key)
            .ok()
            .flatten()
            .map(|value| match value {
                StorageValue::Session(metadata) => metadata,
            })
    }

    pub fn session_account(&self, calls: &[Call]) -> Option<SessionAccount<P, SigningKey, G>> {
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
                self.account.provider().clone(),
                session_signer,
                self.account.guardian.clone(),
                self.account.address,
                self.account.chain_id,
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
            .delegate_account()
            .call()
            .await
            .map(|address| address.into())
            .map_err(ControllerError::CairoSerde)
    }

    pub fn set_delegate_account(
        &self,
        delegate_address: Felt,
    ) -> ExecutionV1<OwnerAccount<P, S, G>> {
        self.contract.set_delegate_account(&delegate_address.into())
    }
}

impl_account!(Controller<P: CartridgeProvider, S: HashSigner, G: HashSigner, B: Backend>, |account: &Controller<P, S, G, B>, context| {
    if let SignerInteractivityContext::Execution { calls } = context {
        account.session_account(calls).is_none()
    } else {
        true
    }
});

impl<P, S, G, B> ConnectedAccount for Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        self.account.provider()
    }

    fn block_id(&self) -> BlockId {
        self.account.block_id()
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G, B> AccountHashAndCallsSigner for Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        match self.session_account(calls) {
            Some(session_account) => session_account.sign_hash_and_calls(hash, calls).await,
            _ => self.account.sign_hash_and_calls(hash, calls).await,
        }
    }
}

impl<P, S, G, B> ExecutionEncoder for Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        self.account.encode_calls(calls)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G, B> AccountHashSigner for Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        self.account.sign_hash(hash).await
    }
}

impl<P, S, G, B> SpecificAccount for Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend,
{
    fn address(&self) -> Felt {
        self.account.address
    }

    fn chain_id(&self) -> Felt {
        self.account.chain_id
    }
}
