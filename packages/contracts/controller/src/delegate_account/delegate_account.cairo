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
        impl ExternalOwners: external_owners_comp::HasComponent<TContractState>,
        +Drop<TContractState>
    > of IDelegateAccount<ComponentState<TContractState>> {
        fn set_delegate_account(
            ref self: ComponentState<TContractState>, delegate_address: ContractAddress
        ) {
            let caller = get_caller_address();
            let external_owners = get_dep_component!(@self, ExternalOwners);

            assert(
                caller == get_contract_address()
                    || external_owners.is_registered_external_owner(caller),
                'caller-not-owner'
            );

            self.delegate_account.write(delegate_address.into());
            self.emit(DelegateAccountChanged { address: delegate_address });
        }

        fn delegate_account(self: @ComponentState<TContractState>) -> ContractAddress {
            self.delegate_account.read()
        }
    }
}
