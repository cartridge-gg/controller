pub mod cartridge;
pub mod guardian;
pub mod outside_execution;
pub mod session;

use crate::{abigen::controller::Call as AbigenCall, typed_data::TypedData};
use cainome::cairo_serde::{CairoSerde, ContractAddress};
pub use cartridge::CartridgeAccount;
pub use guardian::CartridgeGuardianAccount;
use starknet::{accounts::Call, macros::selector};

use crate::signers::SignError;
use async_trait::async_trait;
use starknet::core::types::Felt;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountHashSigner {
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError>;
}

pub enum CallEncoder {}

impl CallEncoder {
    fn encode_calls(calls: &[Call]) -> Vec<Felt> {
        <Vec<AbigenCall> as CairoSerde>::cairo_serialize(
            &calls
                .iter()
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

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountHashAndCallsSigner {
    async fn sign_hash_and_calls(&self, hash: Felt, calls: &[Call])
        -> Result<Vec<Felt>, SignError>;
}

pub trait SpecificAccount {
    fn address(&self) -> Felt;
    fn chain_id(&self) -> Felt;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> AccountHashAndCallsSigner for T
where
    T: AccountHashSigner + Sync,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        _calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        self.sign_hash(hash).await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait MessageSignerAccount {
    async fn sign_message(&self, data: TypedData) -> Result<Vec<Felt>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> MessageSignerAccount for T
where
    T: AccountHashSigner + SpecificAccount + Sync,
{
    async fn sign_message(&self, data: TypedData) -> Result<Vec<Felt>, SignError> {
        let hash = data.encode(self.address())?;
        self.sign_hash(hash).await
    }
}

pub const DECLARATION_SELECTOR: Felt = selector!("__declare_transaction__");

#[macro_export]
macro_rules! impl_execution_encoder {
    ($type:ident<$($gen:ident : $bound:path),*>) => {
        impl<$($gen: $bound + Send),*> ExecutionEncoder for $type<$($gen),*>
        {
            fn encode_calls(&self, calls: &[Call]) -> Vec<starknet::core::types::Felt> {
                $crate::account::CallEncoder::encode_calls(calls)
            }
        }
    }
}

#[macro_export]
macro_rules! impl_account {
    ($type:ident<$($gen:ident : $bound:path),*>) => {
        #[cfg_attr(not(target_arch = "wasm32"), async_trait)]
        #[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
        impl<$($gen: $bound + Send + Sync),*> Account for $type<$($gen),*>
        {
            type SignError = SignError;

            fn address(&self) -> starknet::core::types::Felt {
                $crate::account::SpecificAccount::address(self)
            }

            fn chain_id(&self) -> starknet::core::types::Felt {
                $crate::account::SpecificAccount::chain_id(self)
            }

            async fn sign_execution_v1(
                &self,
                execution: &starknet::accounts::RawExecutionV1,
                query_only: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                let tx_hash = execution.transaction_hash(
                    $crate::account::SpecificAccount::chain_id(self),
                    $crate::account::SpecificAccount::address(self),
                    query_only,
                    self
                );
                let calls = execution.calls();
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            async fn sign_execution_v3(
                &self,
                execution: &starknet::accounts::RawExecutionV3,
                query_only: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                let tx_hash = execution.transaction_hash(
                    $crate::account::SpecificAccount::chain_id(self),
                    $crate::account::SpecificAccount::address(self),
                    query_only,
                    self
                );
                let calls = execution.calls();
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            async fn sign_declaration_v2(
                &self,
                declaration: &starknet::accounts::RawDeclarationV2,
                query_only: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                let tx_hash = declaration.transaction_hash(
                    $crate::account::SpecificAccount::chain_id(self),
                    $crate::account::SpecificAccount::address(self),
                    query_only,
                );
                let calls = vec![starknet::accounts::Call {
                    to: $crate::account::SpecificAccount::address(self),
                    selector: $crate::account::DECLARATION_SELECTOR,
                    calldata: vec![
                        declaration.compiled_class_hash(),
                    ]
                }];
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            async fn sign_declaration_v3(
                &self,
                declaration: &starknet::accounts::RawDeclarationV3,
                query_only: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                let tx_hash = declaration.transaction_hash(
                    $crate::account::SpecificAccount::chain_id(self),
                    $crate::account::SpecificAccount::address(self),
                    query_only,
                );
                let calls = vec![starknet::accounts::Call {
                    to: $crate::account::SpecificAccount::address(self),
                    selector: $crate::account::DECLARATION_SELECTOR,
                    calldata: vec![
                        declaration.compiled_class_hash(),
                    ]
                }];
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            async fn sign_legacy_declaration(
                &self,
                _: &starknet::accounts::RawLegacyDeclaration,
                _: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                unimplemented!("sign_legacy_declaration")
            }

            fn execute_v1(&self, calls: Vec<starknet::accounts::Call>) -> starknet::accounts::ExecutionV1<Self> {
                starknet::accounts::ExecutionV1::new(calls, self)
            }

            fn execute_v3(&self, calls: Vec<starknet::accounts::Call>) -> starknet::accounts::ExecutionV3<Self> {
                starknet::accounts::ExecutionV3::new(calls, self)
            }


            fn execute(&self, calls: Vec<starknet::accounts::Call>) -> starknet::accounts::ExecutionV1<Self> {
                self.execute_v1(calls)
            }

            fn declare_v2(
                &self,
                contract_class: std::sync::Arc<starknet::core::types::FlattenedSierraClass>,
                compiled_class_hash: starknet::core::types::Felt,
            ) -> starknet::accounts::DeclarationV2<Self> {
                starknet::accounts::DeclarationV2::new(contract_class, compiled_class_hash, self)
            }

            fn declare_v3(
                &self,
                contract_class: std::sync::Arc<starknet::core::types::FlattenedSierraClass>,
                compiled_class_hash: starknet::core::types::Felt,
            ) -> starknet::accounts::DeclarationV3<Self> {
                starknet::accounts::DeclarationV3::new(contract_class, compiled_class_hash, self)
            }

            fn declare(
                &self,
                contract_class: std::sync::Arc<starknet::core::types::FlattenedSierraClass>,
                compiled_class_hash: starknet::core::types::Felt,
            ) -> starknet::accounts::DeclarationV2<Self> {
                self.declare_v2(contract_class, compiled_class_hash)
            }

            fn declare_legacy(
                &self,
                contract_class: std::sync::Arc<starknet::core::types::contract::legacy::LegacyContractClass>,
            ) -> starknet::accounts::LegacyDeclaration<Self> {
                starknet::accounts::LegacyDeclaration::new(contract_class, self)
            }
        }
    };
}
