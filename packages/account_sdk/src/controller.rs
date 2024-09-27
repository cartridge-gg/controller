use crate::abigen::controller::{
    OutsideExecution, Owner, Signer as AbigenSigner, SignerSignature, StarknetSigner,
};
use crate::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use crate::account::session::hash::{Policy, Session};
use crate::account::session::SessionAccount;
use crate::account::SpecificAccount;
use crate::account::{AccountHashAndCallsSigner, CallEncoder};
use crate::factory::ControllerFactory;
use crate::hash::MessageHashRev1;
use crate::paymaster::PaymasterError;
use crate::provider::CartridgeProvider;
use crate::signers::Signer;
use crate::storage::{Credentials, Selectors, SessionMetadata, StorageBackend, StorageValue};
use crate::{
    abigen::{self},
    account::AccountHashSigner,
    signers::{HashSigner, SignError, SignerTrait},
};
use crate::{impl_account, OriginProvider};
use async_trait::async_trait;
use cainome::cairo_serde::{self, CairoSerde, NonZero, U256};
use starknet::accounts::{
    AccountDeploymentV1, AccountError, AccountFactory, AccountFactoryError, ExecutionV1,
};
use starknet::core::types::{
    BlockTag, Call, FeeEstimate, FunctionCall, InvokeTransactionResult, StarknetError,
};
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::macros::{felt, selector, short_string};
use starknet::providers::ProviderError;
use starknet::signers::SignerInteractivityContext;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
    signers::{SigningKey, VerifyingKey},
};

#[cfg(target_arch = "wasm32")]
use js_sys::Date;

const ETH_CONTRACT_ADDRESS: Felt =
    felt!("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7");
const WEBAUTHN_GAS: Felt = felt!("3300");

pub const GUARDIAN_SIGNER: Signer = Signer::Starknet(SigningKey::from_secret_scalar(
    short_string!("CARTRIDGE_GUARDIAN"),
));

pub trait Backend: StorageBackend + OriginProvider {}

#[derive(Debug, thiserror::Error)]
pub enum ControllerError {
    #[error(transparent)]
    SignError(#[from] SignError),

    #[error(transparent)]
    StorageError(#[from] crate::storage::StorageError),

    #[error(transparent)]
    AccountError(#[from] AccountError<SignError>),

    #[error("Controller is not deployed. Required fee: {fee_estimate:?}")]
    NotDeployed {
        fee_estimate: Box<FeeEstimate>,
        balance: u128,
    },

    #[error(transparent)]
    AccountFactoryError(#[from] AccountFactoryError<SignError>),

    #[error(transparent)]
    PaymasterError(#[from] PaymasterError),

    #[error(transparent)]
    CairoSerde(#[from] cairo_serde::Error),

    #[error(transparent)]
    ProviderError(#[from] ProviderError),

    #[error("Insufficient balance for transaction. Required fee: {fee_estimate:?}")]
    InsufficientBalance {
        fee_estimate: Box<FeeEstimate>,
        balance: u128,
    },

    #[error("Session already registered. ")]
    SessionAlreadyRegistered,
}

#[derive(Clone)]
pub struct Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    app_id: String,
    address: Felt,
    chain_id: Felt,
    pub username: String,
    salt: Felt,
    pub provider: P,
    owner: Signer,
    contract: Option<Box<abigen::controller::Controller<Self>>>,
    pub factory: ControllerFactory<P>,
    backend: B,
}

impl<P, B> Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        app_id: String,
        username: String,
        class_hash: Felt,
        provider: P,
        owner: Signer,
        address: Felt,
        chain_id: Felt,
        backend: B,
    ) -> Self {
        let salt = cairo_short_string_to_felt(&username).unwrap();

        let mut calldata = Owner::cairo_serialize(&Owner::Signer(owner.signer()));
        calldata.push(Felt::ONE); // no guardian
        let factory = ControllerFactory::new(
            class_hash,
            chain_id,
            calldata,
            owner.clone(),
            provider.clone(),
        );

        let mut controller = Self {
            app_id,
            address,
            chain_id,
            username,
            salt,
            provider,
            owner,
            contract: None,
            factory,
            backend,
        };

        let contract = Box::new(abigen::controller::Controller::new(
            address,
            controller.clone(),
        ));
        controller.contract = Some(contract);

        controller
    }

    pub fn deploy(&self) -> AccountDeploymentV1<'_, ControllerFactory<P>> {
        self.factory.deploy_v1(self.salt)
    }

    pub fn contract(&self) -> &abigen::controller::Controller<Self> {
        self.contract.as_ref().unwrap()
    }

    pub fn set_owner(&mut self, signer: Signer) {
        self.owner = signer;
    }

    pub fn owner_guid(&self) -> Felt {
        self.owner.signer().guid()
    }

    pub async fn create_session(
        &mut self,
        methods: Vec<Policy>,
        expires_at: u64,
    ) -> Result<SessionAccount<P>, ControllerError> {
        let signer = SigningKey::from_random();
        let session = Session::new(methods, expires_at, &signer.signer())?;
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id, self.address);
        let authorization = self.owner.sign(&hash).await?;
        let authorization = Vec::<SignerSignature>::cairo_serialize(&vec![authorization.clone()]);
        self.backend.set(
            &Selectors::session(&self.address, &self.app_id, &self.chain_id),
            &StorageValue::Session(SessionMetadata {
                session: session.clone(),
                max_fee: None,
                credentials: Some(Credentials {
                    authorization: authorization.clone(),
                    private_key: signer.secret_scalar(),
                }),
                is_registered: false,
            }),
        )?;

        let session_signer = Signer::Starknet(signer);
        let session_account = SessionAccount::new(
            self.provider().clone(),
            session_signer,
            self.address,
            self.chain_id,
            authorization,
            session,
        );

        Ok(session_account)
    }

    pub fn register_session_call(
        &mut self,
        methods: Vec<Policy>,
        expires_at: u64,
        public_key: Felt,
    ) -> Result<Call, ControllerError> {
        let pubkey = VerifyingKey::from_scalar(public_key);
        let signer = AbigenSigner::Starknet(StarknetSigner {
            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
        });
        let session = Session::new(methods, expires_at, &signer)?;
        let call = self
            .contract()
            .register_session_getcall(&session.raw(), &self.owner_guid());

        Ok(call)
    }

    pub fn upgrade(&self, new_class_hash: Felt) -> Call {
        self.contract().upgrade_getcall(&new_class_hash.into())
    }

    pub async fn register_session(
        &mut self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: Felt,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let call = self.register_session_call(policies.clone(), expires_at, public_key)?;
        let txn = self.execute(vec![call], max_fee).await?;
        let session = Session::new(
            policies,
            expires_at,
            &AbigenSigner::Starknet(StarknetSigner {
                pubkey: NonZero::new(public_key).unwrap(),
            }),
        )?;

        self.backend.set(
            &Selectors::session(&self.address, &self.app_id, &self.chain_id),
            &StorageValue::Session(SessionMetadata {
                session: session.clone(),
                max_fee: None,
                credentials: None,
                is_registered: false,
            }),
        )?;
        Ok(txn)
    }

    pub async fn execute_from_outside_raw(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let signed = self
            .sign_outside_execution(outside_execution.clone())
            .await?;

        let res = self
            .provider()
            .add_execute_outside_transaction(outside_execution, self.address, signed.signature)
            .await
            .map_err(ControllerError::PaymasterError)?;

        Ok(InvokeTransactionResult {
            transaction_hash: res.transaction_hash,
        })
    }

    pub async fn execute_from_outside(
        &self,
        calls: Vec<Call>,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let now = get_current_timestamp();

        let outside_execution = OutsideExecution {
            caller: OutsideExecutionCaller::Any.into(),
            execute_after: 0,
            execute_before: now + 600,
            calls: calls.into_iter().map(|call| call.into()).collect(),
            nonce: SigningKey::from_random().secret_scalar(),
        };

        self.execute_from_outside_raw(outside_execution).await
    }

    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<Call>,
    ) -> Result<FeeEstimate, ControllerError> {
        let est = self
            .execute_v1(calls.clone())
            .nonce(Felt::from(u64::MAX))
            .estimate_fee()
            .await;

        let balance = self.eth_balance().await?;

        match est {
            Ok(mut fee_estimate) => {
                if self
                    .session_metadata(&Policy::from_calls(&calls), None)
                    .map_or(true, |(_, metadata)| !metadata.is_registered)
                {
                    fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
                }

                if fee_estimate.overall_fee > Felt::from(balance) {
                    Err(ControllerError::InsufficientBalance {
                        fee_estimate: Box::new(fee_estimate),
                        balance,
                    })
                } else {
                    Ok(fee_estimate)
                }
            }
            Err(e) => {
                if let AccountError::Provider(ProviderError::StarknetError(
                    StarknetError::TransactionExecutionError(data),
                )) = &e
                {
                    if data.execution_error.contains("session/already-registered") {
                        return Err(ControllerError::SessionAlreadyRegistered);
                    }

                    if data
                        .execution_error
                        .contains(&format!("{:x} is not deployed.", self.address))
                    {
                        let balance = self.eth_balance().await?;
                        let mut fee_estimate = self.deploy().estimate_fee().await?;
                        fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
                        return Err(ControllerError::NotDeployed {
                            fee_estimate: Box::new(fee_estimate),
                            balance,
                        });
                    }
                }
                Err(ControllerError::AccountError(e))
            }
        }
    }

    pub async fn execute(
        &mut self,
        calls: Vec<Call>,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        if max_fee == Felt::ZERO {
            return self.execute_from_outside(calls).await;
        }

        let result = self.execute_v1(calls.clone()).max_fee(max_fee).send().await;

        match result {
            Ok(tx_result) => {
                // Update is_registered to true after successful execution with a session
                if let Some((key, metadata)) =
                    self.session_metadata(&Policy::from_calls(&calls), None)
                {
                    if !metadata.is_registered {
                        let mut updated_metadata = metadata;
                        updated_metadata.is_registered = true;
                        self.backend
                            .set(&key, &StorageValue::Session(updated_metadata))?;
                    }
                }
                Ok(tx_result)
            }
            Err(e) => {
                if let AccountError::Provider(ProviderError::StarknetError(
                    StarknetError::TransactionExecutionError(data),
                )) = &e
                {
                    if data
                        .execution_error
                        .contains(&format!("{:x} is not deployed.", self.address))
                    {
                        let balance = self.eth_balance().await?;
                        let mut fee_estimate = self.deploy().estimate_fee().await?;
                        fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
                        Err(ControllerError::NotDeployed {
                            fee_estimate: Box::new(fee_estimate),
                            balance,
                        })
                    } else {
                        Err(ControllerError::AccountError(e))
                    }
                } else {
                    Err(ControllerError::AccountError(e))
                }
            }
        }
    }

    pub fn session_metadata(
        &self,
        policies: &[Policy],
        public_key: Option<Felt>,
    ) -> Option<(String, SessionMetadata)> {
        let key: String = Selectors::session(&self.address, &self.app_id, &self.chain_id);
        self.backend
            .get(&key)
            .ok()
            .flatten()
            .and_then(|value| match value {
                StorageValue::Session(metadata) => {
                    let current_timestamp = get_current_timestamp();

                    let session_key_guid = if let Some(public_key) = public_key {
                        let pubkey = VerifyingKey::from_scalar(public_key);
                        AbigenSigner::Starknet(StarknetSigner {
                            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
                        })
                        .guid()
                    } else if let Some(credentials) = &metadata.credentials {
                        let signer = SigningKey::from_secret_scalar(credentials.private_key);
                        AbigenSigner::Starknet(StarknetSigner {
                            pubkey: NonZero::new(signer.verifying_key().scalar()).unwrap(),
                        })
                        .guid()
                    } else {
                        return None;
                    };

                    if metadata.session.expires_at > current_timestamp
                        && metadata.session.session_key_guid == session_key_guid
                        && policies
                            .iter()
                            .all(|policy| metadata.session.is_authorized(policy))
                    {
                        Some((key, metadata))
                    } else {
                        None
                    }
                }
            })
    }

    pub fn session_account(&self, calls: &[Call]) -> Option<SessionAccount<P>> {
        // Check if there's a valid session stored
        let (_, metadata) = self.session_metadata(&Policy::from_calls(calls), None)?;
        let credentials = metadata.credentials.as_ref()?;
        let session_signer =
            Signer::Starknet(SigningKey::from_secret_scalar(credentials.private_key));
        let session_account = SessionAccount::new(
            self.provider().clone(),
            session_signer,
            self.address,
            self.chain_id,
            credentials.authorization.clone(),
            metadata.session,
        );

        Some(session_account)
    }

    pub async fn delegate_account(&self) -> Result<Felt, ControllerError> {
        self.contract()
            .delegate_account()
            .call()
            .await
            .map(|address| address.into())
            .map_err(ControllerError::CairoSerde)
    }

    pub fn set_delegate_account(&self, delegate_address: Felt) -> ExecutionV1<Self> {
        self.contract()
            .set_delegate_account(&delegate_address.into())
    }

    pub async fn eth_balance(&self) -> Result<u128, ControllerError> {
        let address = self.address;
        let result = self
            .provider
            .call(
                FunctionCall {
                    contract_address: ETH_CONTRACT_ADDRESS,
                    entry_point_selector: selector!("balanceOf"),
                    calldata: vec![address],
                },
                BlockId::Tag(BlockTag::Pending),
            )
            .await
            .map_err(ControllerError::ProviderError)?;

        U256::cairo_deserialize(&result, 0)
            .map_err(ControllerError::CairoSerde)
            .map(|v| v.low)
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn get_current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs()
}

#[cfg(target_arch = "wasm32")]
fn get_current_timestamp() -> u64 {
    (Date::now() / 1000.0) as u64
}

impl_account!(Controller<P: CartridgeProvider, B: Backend>, |account: &Controller<P, B>, context| {
    if let SignerInteractivityContext::Execution { calls } = context {
        account.session_account(calls).is_none()
    } else {
        true
    }
});

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, B> ConnectedAccount for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        BlockId::Tag(BlockTag::Pending)
    }

    async fn get_nonce(&self) -> Result<Felt, ProviderError> {
        self.provider
            .get_nonce(self.block_id(), SpecificAccount::address(self))
            .await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, B> AccountHashAndCallsSigner for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        match self.session_account(calls) {
            Some(session_account) => session_account.sign_hash_and_calls(hash, calls).await,
            _ => {
                let signature = self.owner.sign(&hash).await?;
                Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
            }
        }
    }
}

impl<P, B> ExecutionEncoder for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        CallEncoder::encode_calls(calls)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, B> AccountHashSigner for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        let signature = self.owner.sign(&hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
    }
}

impl<P, B> SpecificAccount for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    fn address(&self) -> Felt {
        self.address
    }

    fn chain_id(&self) -> Felt {
        self.chain_id
    }
}
