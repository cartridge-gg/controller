#[starknet::interface]
trait IControllerResolverDelegation<TContractState> {
    fn set_name(ref self: TContractState, name: felt252, address: starknet::ContractAddress);
    fn reset_name(ref self: TContractState, name: felt252);
}

const EXECUTOR_ROLE: felt252 = selector!("EXECUTOR_ROLE");

#[starknet::contract]
mod ControllerResolverDelegation {
    use core::panics::panic_with_byte_array;
    use starknet::{get_caller_address, ContractAddress, ClassHash, storage::Map};
    use starknet::contract_address::ContractAddressZeroable;
    use resolver::interface::IResolver;

    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use super::EXECUTOR_ROLE;

    
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    
    #[abi(embed_v0)]
    impl AccessControlMixinImpl = AccessControlComponent::AccessControlMixinImpl<ContractState>;
    
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        // name -> address
        name_owners: Map::<felt252, ContractAddress>,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DomainToAddressUpdate: DomainToAddressUpdate,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct DomainToAddressUpdate {
        #[key]
        domain: Span<felt252>,
        address: ContractAddress,
    }


    #[constructor]
    fn constructor(
        ref self: ContractState, admin: ContractAddress, mut executors: Span<ContractAddress>
    ) {
        self.accesscontrol.initializer();

        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
       
        while let Option::Some(executor) = executors.pop_front() {
            self.accesscontrol._grant_role(EXECUTOR_ROLE, *executor);
        }
       
    }

    #[abi(embed_v0)]
    impl AdditionResolveImpl of IResolver<ContractState> {
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
            self.accesscontrol.assert_only_role(EXECUTOR_ROLE);

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
            self.accesscontrol.assert_only_role(EXECUTOR_ROLE);

            self.name_owners.write(name, ContractAddressZeroable::zero());
        }

    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);

            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
