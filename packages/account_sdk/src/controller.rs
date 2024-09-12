use crate::abigen::controller::{OutsideExecution, Owner, Signer as AbigenSigner, StarknetSigner};
use crate::account::outside_execution::{OutsideExecutionAccount, OutsideExecutionCaller};
use crate::account::session::hash::{AllowedMethod, Session};
use crate::account::session::SessionAccount;
use crate::account::AccountHashAndCallsSigner;
use crate::account::SpecificAccount;
use crate::constants::ACCOUNT_CLASS_HASH;
use crate::factory::ControllerFactory;
use crate::hash::MessageHashRev1;
use crate::paymaster::PaymasterError;
use crate::provider::CartridgeProvider;
use crate::signers::Signer;
use crate::storage::{Credentials, Selectors, SessionMetadata, StorageBackend, StorageValue};
use crate::{
    abigen::{self},
    account::{AccountHashSigner, OwnerAccount},
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
use starknet::macros::{felt, selector};
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
        fee_estimate: FeeEstimate,
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
        fee_estimate: FeeEstimate,
        balance: u128,
    },
}

pub struct Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend,
{
    app_id: String,
    pub username: String,
    salt: Felt,
    pub provider: P,
    pub(crate) account: OwnerAccount<P>,
    pub(crate) contract: abigen::controller::Controller<OwnerAccount<P>>,
    pub factory: ControllerFactory<OwnerAccount<P>, P>,
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
        provider: P,
        signer: Signer,
        guardian: Signer,
        address: Felt,
        chain_id: Felt,
        backend: B,
    ) -> Self {
        let account = OwnerAccount::new(provider.clone(), signer, guardian, address, chain_id);
        let salt = cairo_short_string_to_felt(&username).unwrap();

        let mut calldata = Owner::cairo_serialize(&Owner::Signer(account.signer.signer()));
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

    pub fn deploy(&self) -> AccountDeploymentV1<ControllerFactory<OwnerAccount<P>, P>> {
        self.factory.deploy_v1(self.salt)
    }

    pub fn owner_guid(&self) -> Felt {
        self.account.signer.signer().guid()
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

    pub async fn register_session(
        &mut self,
        methods: Vec<AllowedMethod>,
        expires_at: u64,
        public_key: Felt,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let pubkey = VerifyingKey::from_scalar(public_key);
        let signer = AbigenSigner::Starknet(StarknetSigner {
            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
        });

        let session = Session::new(methods, expires_at, &signer)?;

        let call = self
            .contract
            .register_session_getcall(&session.raw(), &self.owner_guid());
        let calls = vec![call];
        let txn = self.execute(calls, max_fee).await?;

        Ok(txn)
    }

    pub async fn execute_from_outside_raw(
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
            .map_err(ControllerError::PaymasterError)?;

        Ok(res.transaction_hash)
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
            .map_err(ControllerError::PaymasterError)?;

        Ok(InvokeTransactionResult {
            transaction_hash: res.transaction_hash,
        })
    }

    pub async fn estimate_invoke_fee(
        &self,
        calls: Vec<Call>,
        fee_multiplier: Option<f64>,
    ) -> Result<FeeEstimate, ControllerError> {
        let multiplier = fee_multiplier.unwrap_or(1.0);
        let est = self
            .execute_v1(calls)
            .nonce(Felt::from(u64::MAX))
            .fee_estimate_multiplier(multiplier)
            .estimate_fee()
            .await;

        let balance = self.eth_balance().await?;

        match est {
            Ok(mut fee_estimate) => {
                if self.session_metadata().is_none() {
                    fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
                }

                if fee_estimate.overall_fee > Felt::from(balance) {
                    Err(ControllerError::InsufficientBalance {
                        fee_estimate,
                        balance,
                    })
                } else {
                    Ok(fee_estimate)
                }
            }
            Err(e) => match &e {
                AccountError::Provider(ProviderError::StarknetError(
                    StarknetError::TransactionExecutionError(data),
                )) if data
                    .execution_error
                    .contains(&format!("{:x} is not deployed.", self.account.address)) =>
                {
                    let balance = self.eth_balance().await?;
                    let mut fee_estimate = self.deploy().estimate_fee().await?;
                    fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
                    Err(ControllerError::NotDeployed {
                        fee_estimate,
                        balance,
                    })
                }
                _ => Err(ControllerError::AccountError(e)),
            },
        }
    }

    pub async fn execute(
        &self,
        calls: Vec<Call>,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        if max_fee == Felt::ZERO {
            return self.execute_from_outside(calls).await;
        }

        let result = self.execute_v1(calls).max_fee(max_fee).send().await;

        match result {
            Ok(tx_result) => Ok(tx_result),
            Err(e) => {
                if let AccountError::Provider(ProviderError::StarknetError(
                    StarknetError::TransactionExecutionError(data),
                )) = &e
                {
                    if data
                        .execution_error
                        .contains(&format!("{:x} is not deployed.", self.account.address))
                    {
                        let balance = self.eth_balance().await?;
                        let mut fee_estimate = self.deploy().estimate_fee().await?;
                        fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
                        Err(ControllerError::NotDeployed {
                            fee_estimate,
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

    pub fn session_account(&self, calls: &[Call]) -> Option<SessionAccount<P>> {
        // Check if there's a valid session stored
        let metadata = self.session_metadata()?;

        // Check if all calls are allowed by the session
        if calls
            .iter()
            .all(|call| metadata.session.is_call_allowed(call))
        {
            // Use SessionAccount if all calls are allowed
            let session_signer = Signer::Starknet(SigningKey::from_secret_scalar(
                metadata.credentials.private_key,
            ));
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

    pub fn set_delegate_account(&self, delegate_address: Felt) -> ExecutionV1<OwnerAccount<P>> {
        self.contract.set_delegate_account(&delegate_address.into())
    }

    pub async fn eth_balance(&self) -> Result<u128, ControllerError> {
        let address = self.account.address;
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
        self.account.block_id()
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
            _ => self.account.sign_hash_and_calls(hash, calls).await,
        }
    }
}

impl<P, B> ExecutionEncoder for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        self.account.encode_calls(calls)
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, B> AccountHashSigner for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        self.account.sign_hash(hash).await
    }
}

impl<P, B> SpecificAccount for Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend,
{
    fn address(&self) -> Felt {
        self.account.address
    }

    fn chain_id(&self) -> Felt {
        self.account.chain_id
    }
}
