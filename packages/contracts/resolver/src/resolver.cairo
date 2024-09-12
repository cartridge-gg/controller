#[starknet::interface]
trait IControllerResolverDelegation<TContractState> {
    fn set_name(ref self: TContractState, name: felt252, address: starknet::ContractAddress);
    fn reset_name(ref self: TContractState, name: felt252);
}

#[starknet::contract]
mod ControllerResolverDelegation {
    use core::panics::panic_with_byte_array;
    use starknet::{get_caller_address, ContractAddress, ClassHash, storage::Map};
    use starknet::contract_address::ContractAddressZeroable;
    use resolver::interface::IResolver;

    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use openzeppelin::introspection::src5::SRC5Component;
   
    use registry::registry_component::RegistryComponent;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: RegistryComponent, storage: registry, event: RegistryEvent);
    
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    #[abi(embed_v0)]
    impl RegistryImpl = RegistryComponent::RegistryImpl<ContractState>;

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl RegistryInternalImpl = RegistryComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        // name -> address
        name_owners: Map::<felt252, ContractAddress>,
        // components
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        registry: RegistryComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DomainToAddressUpdate: DomainToAddressUpdate,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        RegistryEvent: RegistryComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct DomainToAddressUpdate {
        #[key]
        domain: Span<felt252>,
        address: ContractAddress,
    }


    #[constructor]
    fn constructor(
        ref self: ContractState, owner: ContractAddress, registry: ContractAddress
    ) {
        self.ownable.initializer(owner);
        self.registry.initializer(registry);
    }

    #[abi(embed_v0)]
    impl ResolverImpl of IResolver<ContractState> {
        fn resolve(
            self: @ContractState, mut domain: Span<felt252>, field: felt252, hint: Span<felt252>
        ) -> felt252 {
            assert(domain.len() == 1, 'Domain must have a length of 1');
            assert(field == 'starknet', 'Not supported');

            let name = *domain.at(0);
            let name_owner: ContractAddress = self.name_owners.read(name);

            if name_owner != ContractAddressZeroable::zero() {
                return name_owner.into();
            }

            panic_with_byte_array(@format!("Unknown {}", name))
        }
    }

    #[abi(embed_v0)]
    impl ControllerResolverDelegationImpl of super::IControllerResolverDelegation<ContractState> {
        fn set_name(ref self: ContractState, name: felt252, address: ContractAddress) {
            self.registry.assert_only_executor();

            let owner = self.name_owners.read(name);
            assert(owner == ContractAddressZeroable::zero(), 'Name is already taken');

            self.name_owners.write(name, address);
            self
                .emit(
                    Event::DomainToAddressUpdate(
                        DomainToAddressUpdate { domain: array![name].span(), address, }
                    )
                )
        }

        fn reset_name(ref self: ContractState, name: felt252) {
            self.registry.assert_only_executor();

            self.name_owners.write(name, ContractAddressZeroable::zero());
        }

    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();

            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
