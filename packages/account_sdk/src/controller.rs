use crate::abigen::controller::SignerSignature;
use crate::account::session::hash::Policy;
use crate::account::{AccountHashAndCallsSigner, CallEncoder};
use crate::constants::{ETH_CONTRACT_ADDRESS, WEBAUTHN_GAS};
use crate::errors::ControllerError;
use crate::factory::ControllerFactory;
use crate::impl_account;
use crate::provider::CartridgeJsonRpcProvider;
use crate::signers::Owner;
use crate::storage::{ControllerMetadata, Storage, StorageBackend};
use crate::typed_data::TypedData;
use crate::{
    abigen::{self},
    signers::{HashSigner, SignError},
};
use async_trait::async_trait;
use cainome::cairo_serde::{CairoSerde, U256};
use starknet::accounts::{AccountDeploymentV1, AccountError, AccountFactory, ExecutionV1};
use starknet::core::types::{
    BlockTag, Call, FeeEstimate, FunctionCall, InvokeTransactionResult, StarknetError,
};
use starknet::core::utils::cairo_short_string_to_felt;
use starknet::macros::selector;
use starknet::providers::{Provider, ProviderError};
use starknet::signers::SignerInteractivityContext;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
};
use url::Url;

#[cfg(all(test, not(target_arch = "wasm32")))]
#[path = "controller_test.rs"]
mod controller_test;

#[derive(Clone)]
pub struct Controller {
    pub(crate) app_id: String,
    pub address: Felt,
    pub chain_id: Felt,
    pub(crate) class_hash: Felt,
    pub rpc_url: Url,
    pub username: String,
    pub(crate) salt: Felt,
    pub provider: CartridgeJsonRpcProvider,
    pub(crate) owner: Owner,
    contract: Option<Box<abigen::controller::Controller<Self>>>,
    factory: ControllerFactory,
    pub storage: Storage,
    nonce: Felt,
    pub(crate) execute_from_outside_nonce: (Felt, u128),
}

impl Controller {
    pub fn new(
        app_id: String,
        username: String,
        class_hash: Felt,
        rpc_url: Url,
        owner: Owner,
        address: Felt,
        chain_id: Felt,
    ) -> Self {
        let provider = CartridgeJsonRpcProvider::new(rpc_url.clone());
        let salt = cairo_short_string_to_felt(&username).unwrap();

        let factory = ControllerFactory::new(salt, chain_id, owner.clone(), provider.clone());

        let mut controller = Self {
            app_id: app_id.clone(),
            address,
            chain_id,
            class_hash,
            rpc_url,
            username,
            salt,
            provider,
            owner,
            contract: None,
            factory,
            storage: Storage::default(),
            nonce: Felt::ZERO,
            execute_from_outside_nonce: (
                starknet::signers::SigningKey::from_random().secret_scalar(),
                0,
            ),
        };

        let contract = Box::new(abigen::controller::Controller::new(
            address,
            controller.clone(),
        ));
        controller.contract = Some(contract);

        controller
            .storage
            .set_controller(
                app_id.as_str(),
                address,
                ControllerMetadata::from(&controller),
            )
            .expect("Should store controller");

        controller
    }

    pub fn from_storage(app_id: String) -> Result<Option<Self>, ControllerError> {
        let storage = Storage::default();
        let metadata = storage.controller(&app_id).map_err(ControllerError::from)?;
        if let Some(m) = metadata {
            let rpc_url = Url::parse(&m.rpc_url).map_err(ControllerError::from)?;
            Ok(Some(Controller::new(
                app_id,
                m.username,
                m.class_hash,
                rpc_url,
                m.owner.try_into().map_err(ControllerError::from)?,
                m.address,
                m.chain_id,
            )))
        } else {
            Ok(None)
        }
    }

    pub fn deploy(&self) -> AccountDeploymentV1<'_, ControllerFactory> {
        self.factory.deploy_v1(self.salt)
    }

    pub fn disconnect(&mut self) -> Result<(), ControllerError> {
        self.storage.clear().map_err(ControllerError::from)
    }

    pub fn contract(&self) -> &abigen::controller::Controller<Self> {
        self.contract.as_ref().unwrap()
    }

    pub fn set_owner(&mut self, owner: Owner) {
        self.owner = owner;
    }

    pub fn owner_guid(&self) -> Felt {
        self.owner.clone().into()
    }

    async fn build_not_deployed_err(&self) -> ControllerError {
        let balance = match self.eth_balance().await {
            Ok(balance) => balance,
            Err(e) => return e,
        };

        let mut fee_estimate = match ControllerFactory::new(
            self.class_hash,
            self.chain_id,
            self.owner.clone(),
            self.provider.clone(),
        )
        .deploy_v1(self.salt)
        .estimate_fee()
        .await
        {
            Ok(estimate) => estimate,
            Err(e) => return ControllerError::from(e),
        };

        fee_estimate.overall_fee += WEBAUTHN_GAS * fee_estimate.gas_price;
        ControllerError::NotDeployed {
            fee_estimate: Box::new(fee_estimate),
            balance,
        }
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
                        return Err(self.build_not_deployed_err().await);
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
            return self.execute_from_outside_v3(calls).await;
        }

        let mut retry_count = 0;
        let max_retries = 1;

        loop {
            let nonce = self.get_nonce().await?;
            let result = self
                .execute_v1(calls.clone())
                .nonce(nonce)
                .max_fee(max_fee)
                .send()
                .await;

            match result {
                Ok(tx_result) => {
                    // Update nonce
                    self.nonce += Felt::ONE;

                    // Update is_registered to true after successful execution with a session
                    if let Some((key, metadata)) =
                        self.session_metadata(&Policy::from_calls(&calls), None)
                    {
                        if !metadata.is_registered {
                            let mut updated_metadata = metadata;
                            updated_metadata.is_registered = true;
                            self.storage.set_session(&key, updated_metadata)?;
                        }
                    }
                    return Ok(tx_result);
                }
                Err(e) => {
                    match &e {
                        AccountError::Provider(ProviderError::StarknetError(
                            StarknetError::TransactionExecutionError(data),
                        )) if data
                            .execution_error
                            .contains(&format!("{:x} is not deployed.", self.address)) =>
                        {
                            return Err(self.build_not_deployed_err().await);
                        }
                        AccountError::Provider(ProviderError::StarknetError(
                            StarknetError::InvalidTransactionNonce,
                        )) => {
                            if retry_count < max_retries {
                                // Refetch nonce from the provider
                                let new_nonce = self
                                    .provider
                                    .get_nonce(self.block_id(), self.address())
                                    .await?;
                                self.nonce = new_nonce;
                                retry_count += 1;
                                continue;
                            }
                        }
                        AccountError::Provider(ProviderError::StarknetError(
                            StarknetError::ValidationFailure(data),
                        )) => {
                            if data.starts_with("Invalid transaction nonce of contract at address")
                                && retry_count < max_retries
                            {
                                // Refetch nonce from the provider
                                let new_nonce = self
                                    .provider
                                    .get_nonce(self.block_id(), self.address())
                                    .await?;
                                self.nonce = new_nonce;
                                retry_count += 1;
                                continue;
                            } else if data.contains(&format!("{:x} is not deployed.", self.address))
                            {
                                return Err(self.build_not_deployed_err().await);
                            }
                        }
                        _ => {}
                    }
                    return Err(ControllerError::AccountError(e));
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

    async fn get_nonce(&self) -> Result<Felt, ProviderError> {
        let current_nonce = self.nonce;

        if current_nonce == Felt::ZERO {
            match self
                .provider
                .get_nonce(self.block_id(), self.address())
                .await
            {
                Ok(nonce) => Ok(nonce),
                Err(ProviderError::StarknetError(StarknetError::ContractNotFound)) => {
                    Ok(Felt::ZERO)
                }
                Err(e) => Err(e),
            }
        } else {
            Ok(current_nonce)
        }
    }
}

impl_account!(Controller, |account: &Controller, context| {
    if let SignerInteractivityContext::Execution { calls } = context {
        account.session_account(calls).is_none()
    } else {
        true
    }
});

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl ConnectedAccount for Controller {
    type Provider = CartridgeJsonRpcProvider;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        BlockId::Tag(BlockTag::Pending)
    }

    async fn get_nonce(&self) -> Result<Felt, ProviderError> {
        self.get_nonce().await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl AccountHashAndCallsSigner for Controller {
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

impl ExecutionEncoder for Controller {
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        CallEncoder::encode_calls(calls)
    }
}
