use std::sync::Arc;

use crate::abigen::controller::{OutsideExecution, Signer};
use crate::account::outside_execution::OutsideExecutionAccount;
use crate::account::session::hash::{AllowedMethod, Session};
use crate::account::session::SessionAccount;
use crate::account::{AccountHashAndCallsSigner, DECLARATION_SELECTOR};
use crate::constants::ACCOUNT_CLASS_HASH;
use crate::factory::ControllerFactory;
use crate::hash::MessageHashRev1;
use crate::provider::{CartridgeProvider, CartridgeProviderError};
use crate::signers::DeviceError;
use crate::storage::{Credentials, Selectors, SessionMetadata, StorageBackend, StorageValue};
use crate::OriginProvider;
use crate::{
    abigen::{self},
    account::{AccountHashSigner, OwnerAccount},
    signers::{HashSigner, SignError},
};
use async_trait::async_trait;
use cainome::cairo_serde::{self, CairoSerde};
use starknet::accounts::{
    AccountDeploymentV1, AccountError, AccountFactory, AccountFactoryError, DeclarationV2,
    DeclarationV3, ExecutionV1, ExecutionV3, LegacyDeclaration, RawDeclarationV2, RawDeclarationV3,
    RawExecutionV1, RawExecutionV3, RawLegacyDeclaration,
};
use starknet::core::types::contract::legacy::LegacyContractClass;
use starknet::core::types::{FeeEstimate, FlattenedSierraClass, InvokeTransactionResult};
use starknet::core::utils::{cairo_short_string_to_felt, CairoShortStringToFeltError};
use starknet::{
    accounts::{Account, Call, ConnectedAccount, ExecutionEncoder},
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
    pub username: String,
    salt: Felt,
    pub provider: P,
    pub(crate) account: OwnerAccount<P, S, G>,
    pub(crate) contract: abigen::controller::Controller<OwnerAccount<P, S, G>>,
    pub factory: ControllerFactory<OwnerAccount<P, S, G>, P>,
    backend: B,
    is_signer_interactive: bool,
}

impl<P, S, G, B> Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    pub fn new(
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
            username,
            salt,
            provider,
            account: account.clone(),
            contract: abigen::controller::Controller::new(address, account),
            factory,
            backend,
            is_signer_interactive: false,
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
            &Selectors::session(
                &self.account.address,
                &B::origin().map_err(ControllerError::DeviceError)?,
                &self.account.chain_id,
            ),
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

        Ok(res.transaction_hash)
    }

    pub async fn estimate_invoke_fee(
        &mut self,
        calls: Vec<Call>,
        fee_multiplier: Option<f64>,
    ) -> Result<FeeEstimate, ControllerError> {
        let multiplier = fee_multiplier.unwrap_or(1.0);

        match self.session_account(&calls) {
            Ok(Some(session_account)) => {
                self.is_signer_interactive = false;
                return session_account
                    .execute_v1(calls)
                    .fee_estimate_multiplier(multiplier)
                    .estimate_fee()
                    .await
                    .map_err(ControllerError::AccountError);
            }
            _ => {
                self.is_signer_interactive = true;
                return self
                    .account
                    .execute_v1(calls)
                    .fee_estimate_multiplier(multiplier)
                    .estimate_fee()
                    .await
                    .map_err(ControllerError::AccountError);
            }
        }
    }

    pub async fn execute(
        &mut self,
        calls: Vec<Call>,
        nonce: Felt,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        match self.session_account(&calls) {
            Ok(Some(session_account)) => {
                self.is_signer_interactive = false;
                session_account
                    .execute_v1(calls)
                    .max_fee(max_fee)
                    .nonce(nonce)
                    .send()
                    .await
                    .map_err(ControllerError::AccountError)
            }
            _ => {
                self.is_signer_interactive = true;
                self.account
                    .execute_v1(calls)
                    .max_fee(max_fee)
                    .nonce(nonce)
                    .send()
                    .await
                    .map_err(ControllerError::AccountError)
            }
        }
    }

    pub fn session_account(
        &self,
        calls: &[Call],
    ) -> Result<Option<SessionAccount<P, SigningKey, G>>, ControllerError> {
        // Check if there's a valid session stored
        if let Some(StorageValue::Session(metadata)) = self.backend.get(&Selectors::session(
            &self.account.address,
            &B::origin().map_err(ControllerError::DeviceError)?,
            &self.account.chain_id,
        ))? {
            // Check if all calls are allowed by the session
            if calls
                .iter()
                .all(|call| metadata.session.is_call_allowed(call))
            {
                // Use SessionAccount if all calls are allowed
                let session_signer =
                    SigningKey::from_secret_scalar(metadata.credentials.private_key);
                let session_account = SessionAccount::new(
                    self.account.provider().clone(),
                    session_signer,
                    self.account.guardian.clone(),
                    self.account.address,
                    self.account.chain_id,
                    metadata.credentials.authorization,
                    metadata.session,
                );
                return Ok(Some(session_account));
            }
        }

        // Use OwnerAccount if no valid session or not all calls are allowed
        Ok(None)
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

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G, B> Account for Controller<P, S, G, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    B: Backend + Clone,
{
    type SignError = SignError;

    fn address(&self) -> Felt {
        self.account.address
    }

    fn is_signer_interactive(&self) -> bool {
        self.is_signer_interactive
    }

    fn chain_id(&self) -> Felt {
        self.account.chain_id
    }

    async fn sign_execution_v1(
        &self,
        execution: &RawExecutionV1,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = execution.transaction_hash(self.chain_id(), self.address(), query_only, self);
        let calls = execution.calls();
        self.sign_hash_and_calls(tx_hash, &calls).await
    }

    async fn sign_execution_v3(
        &self,
        execution: &RawExecutionV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = execution.transaction_hash(self.chain_id(), self.address(), query_only, self);
        let calls = execution.calls();
        self.sign_hash_and_calls(tx_hash, &calls).await
    }

    async fn sign_declaration_v2(
        &self,
        declaration: &RawDeclarationV2,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = declaration.transaction_hash(self.chain_id(), self.address(), query_only);
        let calls = vec![Call {
            to: self.address(),
            selector: DECLARATION_SELECTOR,
            calldata: vec![declaration.compiled_class_hash()],
        }];
        self.sign_hash_and_calls(tx_hash, &calls).await
    }

    async fn sign_declaration_v3(
        &self,
        declaration: &RawDeclarationV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = declaration.transaction_hash(self.chain_id(), self.address(), query_only);
        let calls = vec![Call {
            to: self.address(),
            selector: DECLARATION_SELECTOR,
            calldata: vec![declaration.compiled_class_hash()],
        }];
        self.sign_hash_and_calls(tx_hash, &calls).await
    }

    async fn sign_legacy_declaration(
        &self,
        _: &RawLegacyDeclaration,
        _: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        unimplemented!("sign_legacy_declaration")
    }

    fn execute_v1(&self, calls: Vec<Call>) -> ExecutionV1<ConnectedAccount> {
        match self.session_account(&calls) {
            Ok(Some(session_account)) => ExecutionV1::new(calls, session_account),
            _ => ExecutionV1::new(calls, self.account.clone()),
        }
    }

    fn execute_v3(&self, calls: Vec<Call>) -> ExecutionV3<Self> {
        ExecutionV3::new(calls, self)
    }

    fn execute(&self, calls: Vec<Call>) -> ExecutionV1<Self> {
        self.execute_v1(calls)
    }

    fn declare_v2(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: Felt,
    ) -> DeclarationV2<Self> {
        DeclarationV2::new(contract_class, compiled_class_hash, self)
    }

    fn declare_v3(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: Felt,
    ) -> DeclarationV3<Self> {
        DeclarationV3::new(contract_class, compiled_class_hash, self)
    }

    fn declare(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: Felt,
    ) -> DeclarationV2<Self> {
        self.declare_v2(contract_class, compiled_class_hash)
    }

    fn declare_legacy(&self, contract_class: Arc<LegacyContractClass>) -> LegacyDeclaration<Self> {
        LegacyDeclaration::new(contract_class, self)
    }
}

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
            Ok(Some(session_account)) => session_account.sign_hash_and_calls(hash, calls).await,
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

enum Executor<A: Account, B: Account> {
    Owner(A),
    Session(B),
}

impl<A: Account, B: Account> Account for Executor<A, B> {
    type SignError = SignError;

    fn address(&self) -> Felt {
        match self {
            Executor::Owner(account) => account.address(),
            Executor::Session(account) => account.address(),
        }
    }

    fn is_signer_interactive(&self) -> bool {
        match self {
            Executor::Owner(account) => account.is_signer_interactive(),
            Executor::Session(account) => account.is_signer_interactive(),
        }
    }

    fn chain_id(&self) -> Felt {
        match self {
            Executor::Owner(account) => account.chain_id(),
            Executor::Session(account) => account.chain_id(),
        }
    }

    async fn sign_execution_v1(
        &self,
        execution: &RawExecutionV1,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        match self {
            Executor::Owner(account) => account.sign_execution_v1(execution, query_only).await,
            Executor::Session(account) => account.sign_execution_v1(execution, query_only).await,
        }
    }

    async fn sign_declaration_v2(
        &self,
        declaration: &RawDeclarationV2,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        match self {
            Executor::Owner(account) => account.sign_declaration_v2(declaration, query_only).await,
            Executor::Session(account) => {
                account.sign_declaration_v2(declaration, query_only).await
            }
        }
    }

    async fn sign_execution_v3(
        &self,
        execution: &RawExecutionV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        match self {
            Executor::Owner(account) => account.sign_execution_v3(execution, query_only).await,
            Executor::Session(account) => account.sign_execution_v3(execution, query_only).await,
        }
    }

    async fn sign_declaration_v3(
        &self,
        declaration: &RawDeclarationV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        match self {
            Executor::Owner(account) => account.sign_declaration_v3(declaration, query_only).await,
            Executor::Session(account) => {
                account.sign_declaration_v3(declaration, query_only).await
            }
        }
    }

    async fn sign_legacy_declaration(
        &self,
        _: &RawLegacyDeclaration,
        _: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        unimplemented!("sign_legacy_declaration")
    }

    fn execute_v1(&self, calls: Vec<Call>) -> ExecutionV1<Self> {
        match self {
            Executor::Owner(account) => account.execute_v1(calls),
            Executor::Session(account) => account.execute_v1(calls),
        }
    }

    fn execute_v3(&self, calls: Vec<Call>) -> ExecutionV3<Self> {
        match self {
            Executor::Owner(account) => account.execute_v3(calls),
            Executor::Session(account) => account.execute_v3(calls),
        }
    }

    fn execute(&self, calls: Vec<Call>) -> ExecutionV1<Self> {
        match self {
            Executor::Owner(account) => account.execute_v1(calls),
            Executor::Session(account) => account.execute_v1(calls),
        }
    }

    fn declare_v2(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: Felt,
    ) -> DeclarationV2<Self> {
        match self {
            Executor::Owner(account) => account.declare_v2(contract_class, compiled_class_hash),
            Executor::Session(account) => account.declare_v2(contract_class, compiled_class_hash),
        }
    }

    fn declare_v3(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: Felt,
    ) -> DeclarationV3<Self> {
        DeclarationV3::new(contract_class, compiled_class_hash, self)
    }

    fn declare(
        &self,
        contract_class: Arc<FlattenedSierraClass>,
        compiled_class_hash: Felt,
    ) -> DeclarationV2<Self> {
        DeclarationV2::new(contract_class, compiled_class_hash, self)
    }

    fn declare_legacy(&self, contract_class: Arc<LegacyContractClass>) -> LegacyDeclaration<Self> {
        match self {
            Executor::Owner(account) => account.declare_legacy(contract_class),
            Executor::Session(account) => account.declare_legacy(contract_class),
        }
    }
}

impl<A: Account, B: Account> ExecutionEncoder for Executor<A, B> {
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        match self {
            Executor::Owner(account) => account.encode_calls(calls),
            Executor::Session(account) => account.encode_calls(calls),
        }
    }
}
