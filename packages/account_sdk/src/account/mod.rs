pub mod cartridge;
pub mod guardian;
pub mod outside_execution;
pub mod session;

use crate::abigen::cartridge_account::Call as AbigenCall;
use cainome::cairo_serde::{CairoSerde, ContractAddress};
pub use cartridge::CartridgeAccount;
pub use guardian::CartridgeGuardianAccount;
use starknet::{accounts::Call, macros::selector};

use crate::signers::SignError;
use async_trait::async_trait;
use starknet_crypto::FieldElement;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountHashSigner {
    async fn sign_hash(&self, hash: FieldElement) -> Result<Vec<FieldElement>, SignError>;
}

pub enum CallEncoder {}

impl CallEncoder {
    fn encode_calls(calls: &[Call]) -> Vec<FieldElement> {
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
    async fn sign_hash_and_calls(
        &self,
        hash: FieldElement,
        calls: &[Call],
    ) -> Result<Vec<FieldElement>, SignError>;
}

pub trait SpecificAccount {
    fn address(&self) -> FieldElement;
    fn chain_id(&self) -> FieldElement;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> AccountHashAndCallsSigner for T
where
    T: AccountHashSigner + Sync,
{
    async fn sign_hash_and_calls(
        &self,
        hash: FieldElement,
        _calls: &[Call],
    ) -> Result<Vec<FieldElement>, SignError> {
        self.sign_hash(hash).await
    }
}

pub const DECLARATION_SELECTOR: FieldElement = selector!("__declare_transaction__");

#[macro_export]
macro_rules! impl_execution_encoder {
    ($type:ident<$($gen:ident : $bound:path),*>) => {
        impl<$($gen: $bound + Send),*> ExecutionEncoder for $type<$($gen),*>
        {
            fn encode_calls(&self, calls: &[Call]) -> Vec<FieldElement> {
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

            fn address(&self) -> FieldElement {
                $crate::account::SpecificAccount::address(self)
            }

            fn chain_id(&self) -> FieldElement {
                $crate::account::SpecificAccount::chain_id(self)
            }

            async fn sign_execution(
                &self,
                execution: &starknet::accounts::RawExecution,
                query_only: bool,
            ) -> Result<Vec<FieldElement>, Self::SignError> {
                let tx_hash = execution.transaction_hash(
                    $crate::account::SpecificAccount::chain_id(self),
                    $crate::account::SpecificAccount::address(self),
                    query_only,
                    self
                );
                let calls = execution.calls();
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            async fn sign_declaration(
                &self,
                declaration: &starknet::accounts::RawDeclaration,
                query_only: bool,
            ) -> Result<Vec<FieldElement>, Self::SignError> {
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
                _legacy_declaration: &starknet::accounts::RawLegacyDeclaration,
                _query_only: bool,
            ) -> Result<Vec<FieldElement>, Self::SignError> {
                unimplemented!("sign_legacy_declaration")
            }

            fn execute(&self, calls: Vec<starknet::accounts::Call>) -> starknet::accounts::Execution<Self> {
                starknet::accounts::Execution::new(calls, self)
            }

            fn declare(
                &self,
                contract_class: std::sync::Arc<starknet::core::types::FlattenedSierraClass>,
                compiled_class_hash: FieldElement,
            ) -> starknet::accounts::Declaration<Self> {
                starknet::accounts::Declaration::new(contract_class, compiled_class_hash, self)
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
