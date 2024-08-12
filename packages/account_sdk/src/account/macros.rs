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
    ($type:ident<$($gen:ident : $bound:path),*>, $is_interactive:expr) => {
        #[cfg_attr(not(target_arch = "wasm32"), async_trait)]
        #[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
        impl<$($gen: $bound + Send + Sync + Clone),*> Account for $type<$($gen),*>
        {
            type SignError = SignError;

            fn address(&self) -> starknet::core::types::Felt {
                $crate::account::SpecificAccount::address(self)
            }

            fn is_signer_interactive(&self, context: starknet::signers::SignerInteractivityContext) -> bool {
                ($is_interactive)(self, context)
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
                let calls = vec![starknet::core::types::Call {
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
                let calls = vec![starknet::core::types::Call {
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

            fn execute_v1(&self, calls: Vec<starknet::core::types::Call>) -> starknet::accounts::ExecutionV1<Self> {
                starknet::accounts::ExecutionV1::new(calls, self)
            }

            fn execute_v3(&self, calls: Vec<starknet::core::types::Call>) -> starknet::accounts::ExecutionV3<Self> {
                starknet::accounts::ExecutionV3::new(calls, self)
            }


            fn execute(&self, calls: Vec<starknet::core::types::Call>) -> starknet::accounts::ExecutionV1<Self> {
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
