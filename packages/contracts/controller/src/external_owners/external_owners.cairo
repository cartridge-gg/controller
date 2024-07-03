#[starknet::component]
mod external_owners_component {
    use controller::external_owners::interface::IExternalOwners;
    use starknet::{get_caller_address, get_contract_address, ContractAddress};

    #[storage]
    struct Storage {
        external_owners: LegacyMap<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ExternalOwnerRegistered: ExternalOwnerRegistered,
        ExternalOwnerRemoved: ExternalOwnerRemoved,
    }

    #[derive(Drop, starknet::Event)]
    struct ExternalOwnerRegistered {
        address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ExternalOwnerRemoved {
        address: ContractAddress,
    }

    #[embeddable_as(ExternalOwnersImpl)]
    impl ImplExternalOwners<
        TContractState, +HasComponent<TContractState>, +Drop<TContractState>
    > of IExternalOwners<ComponentState<TContractState>> {
        fn register_external_owner(
            ref self: ComponentState<TContractState>, external_owner_address: ContractAddress
        ) {
            let caller = get_caller_address();
            assert(
                caller == get_contract_address() || self.is_registered_external_owner(caller),
                'caller-not-owner'
            );
            assert(
                self.is_registered_external_owner(external_owner_address) == false,
                'ext-owners/already-registered'
            );
            self.external_owners.write(external_owner_address.into(), true);
            self.emit(ExternalOwnerRegistered { address: external_owner_address });
        }

        fn remove_external_owner(
            ref self: ComponentState<TContractState>, external_owner_address: ContractAddress
        ) {
            assert(self.is_registered_external_owner(get_caller_address()), 'caller-not-owner');
            assert(
                self.is_registered_external_owner(external_owner_address),
                'ext-owners/not-registered'
            );
            self.external_owners.write(external_owner_address.into(), false);
            self.emit(ExternalOwnerRemoved { address: external_owner_address });
        }

        fn is_registered_external_owner(
            self: @ComponentState<TContractState>, external_owner_address: ContractAddress
        ) -> bool {
            self.external_owners.read(external_owner_address.into())
        }
    }
}
