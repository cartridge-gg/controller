#[macro_export]
macro_rules! impl_execution_encoder {
    ($type:ident $(< $($gen:ident : $bound:path),* >)?) => {
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
    ($type:ident $(< $($gen:ident : $bound:path),* >)?, $is_interactive:expr) => {
        #[cfg_attr(not(target_arch = "wasm32"), async_trait)]
        #[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
        impl$(<$($gen:$bound + Send + Sync + Clone),*>)* Account for $type$(<$($gen),*>)*
        {
            type SignError = SignError;

            fn address(&self) -> starknet::core::types::Felt {
                self.address
            }

            fn is_signer_interactive(&self, context: starknet::signers::SignerInteractivityContext) -> bool {
                ($is_interactive)(self, context)
            }

            fn chain_id(&self) -> starknet::core::types::Felt {
                self.chain_id
            }

            async fn sign_execution_v3(
                &self,
                execution: &starknet::accounts::RawExecutionV3,
                query_only: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                let tx_hash = execution.transaction_hash(
                    starknet::accounts::Account::chain_id(self),
                    starknet::accounts::Account::address(self),
                    query_only,
                    self
                );
                let calls = execution.calls();
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            async fn sign_declaration_v3(
                &self,
                declaration: &starknet::accounts::RawDeclarationV3,
                query_only: bool,
            ) -> Result<Vec<starknet::core::types::Felt>, Self::SignError> {
                let tx_hash = declaration.transaction_hash(
                    starknet::accounts::Account::chain_id(self),
                    starknet::accounts::Account::address(self),
                    query_only,
                );
                let calls = vec![starknet::core::types::Call {
                    to: starknet::accounts::Account::address(self),
                    selector: $crate::account::DECLARATION_SELECTOR,
                    calldata: vec![
                        declaration.compiled_class_hash(),
                    ]
                }];
                self.sign_hash_and_calls(tx_hash, &calls).await
            }

            fn execute_v3(&self, calls: Vec<starknet::core::types::Call>) -> starknet::accounts::ExecutionV3<Self> {
                starknet::accounts::ExecutionV3::new(calls, self)
            }

            fn declare_v3(
                &self,
                contract_class: std::sync::Arc<starknet::core::types::FlattenedSierraClass>,
                compiled_class_hash: starknet::core::types::Felt,
            ) -> starknet::accounts::DeclarationV3<Self> {
                starknet::accounts::DeclarationV3::new(contract_class, compiled_class_hash, self)
            }
        }
    };
}
