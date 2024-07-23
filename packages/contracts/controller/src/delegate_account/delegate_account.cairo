#[starknet::component]
mod delegate_account_component {
    use controller::delegate_account::interface::IDelegateAccount;
    use starknet::{get_caller_address, get_contract_address, ContractAddress};

    use controller::external_owners::external_owners::external_owners_component as external_owners_comp;
    use external_owners_comp::ImplExternalOwners;

    #[storage]
    struct Storage {
        delegate_account: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DelegateAccountChanged: DelegateAccountChanged,
    }

    #[derive(Drop, starknet::Event)]
    struct DelegateAccountChanged {
        address: ContractAddress,
    }

    #[embeddable_as(DelegateAccountImpl)]
    impl ImplDelegateAccount<
        TContractState,
        +HasComponent<TContractState>,
        +IAllowedCallerCallback<TContractState>,
        +Drop<TContractState>
    > of IDelegateAccount<ComponentState<TContractState>> {
        fn set_delegate_account(
            ref self: ComponentState<TContractState>, delegate_address: ContractAddress
        ) {
            let contract = self.get_contract();
            contract.is_caller_allowed(get_caller_address());

            self.delegate_account.write(delegate_address.into());
            self.emit(DelegateAccountChanged { address: delegate_address });
        }

        fn delegate_account(self: @ComponentState<TContractState>) -> ContractAddress {
            self.delegate_account.read()
        }
    }
}
