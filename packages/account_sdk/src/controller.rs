use crate::abigen::controller::{Owner, SignerSignature};
use crate::account::session::hash::Policy;
use crate::account::{AccountHashAndCallsSigner, CallEncoder};
use crate::constants::{ETH_CONTRACT_ADDRESS, WEBAUTHN_GAS};
use crate::errors::ControllerError;
use crate::factory::ControllerFactory;
use crate::provider::CartridgeProvider;
use crate::signers::Signer;
use crate::storage::StorageValue;
use crate::typed_data::TypedData;
use crate::{
    abigen::{self},
    signers::{HashSigner, SignError, SignerTrait},
};
use crate::{impl_account, Backend};
use async_trait::async_trait;
use cainome::cairo_serde::{CairoSerde, U256};
use starknet::accounts::{AccountDeploymentV1, AccountError, AccountFactory, ExecutionV1};
use starknet::core::types::{
    BlockTag, Call, FeeEstimate, FunctionCall, InvokeTransactionResult, StarknetError,
};
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::macros::selector;
use starknet::providers::ProviderError;
use starknet::signers::SignerInteractivityContext;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
};

#[cfg(test)]
#[path = "controller_test.rs"]
mod controller_test;

#[derive(Clone)]
pub struct Controller<P, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    B: Backend + Clone,
{
    pub(crate) app_id: String,
    pub(crate) address: Felt,
    pub(crate) chain_id: Felt,
    pub username: String,
    salt: Felt,
    provider: P,
    pub(crate) owner: Signer,
    contract: Option<Box<abigen::controller::Controller<Self>>>,
    pub factory: ControllerFactory<P>,
    pub(crate) backend: B,
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

    pub async fn sign_message(&self, data: TypedData) -> Result<Vec<Felt>, SignError> {
        let hash = data.encode(self.address)?;
        let signature = self.owner.sign(&hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
    }
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
            .get_nonce(self.block_id(), self.address())
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
