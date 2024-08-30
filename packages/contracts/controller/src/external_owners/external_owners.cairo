#[starknet::component]
mod external_owners_component {
    use starknet::{get_caller_address, get_contract_address, ContractAddress, storage::Map};

    use controller::external_owners::interface::IExternalOwners;
    use controller::account::IAssertOwner;

    #[storage]
    struct Storage {
        external_owners: Map<felt252, bool>,
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
        TContractState,
        +HasComponent<TContractState>,
        +IAssertOwner<TContractState>,
        +Drop<TContractState>
    > of IExternalOwners<ComponentState<TContractState>> {
        fn register_external_owner(
            ref self: ComponentState<TContractState>, external_owner_address: ContractAddress
        ) {
            self.get_contract().assert_owner();
            self._register_external_owner(external_owner_address);
        }

        fn remove_external_owner(
            ref self: ComponentState<TContractState>, external_owner_address: ContractAddress
        ) {
            self.get_contract().assert_owner();

            assert(
                self.is_external_owner(external_owner_address),
                'ext-owners/not-registered'
            );

            self.external_owners.write(external_owner_address.into(), false);
            self.emit(ExternalOwnerRemoved { address: external_owner_address });
        }

        fn is_external_owner(
            self: @ComponentState<TContractState>, external_owner_address: ContractAddress
        ) -> bool {
            self.external_owners.read(external_owner_address.into())
        }
    }

    #[generate_trait]
    impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +IAssertOwner<TContractState>,
        +Drop<TContractState>
    > of InternalTrait<TContractState> {
        fn _register_external_owner(
            ref self: ComponentState<TContractState>, external_owner_address: ContractAddress
        ) {
            assert(
                self.is_external_owner(external_owner_address) == false,
                'ext-owners/already-registered'
            );

            self.external_owners.write(external_owner_address.into(), true);
            self.emit(ExternalOwnerRegistered { address: external_owner_address });
        }
    }
}
