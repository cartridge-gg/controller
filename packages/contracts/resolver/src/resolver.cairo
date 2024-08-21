#[starknet::interface]
trait IControllerResolverDelegation<TContractState> {
    fn set_name(ref self: TContractState, name: felt252, address: starknet::ContractAddress);
    fn set_owner(ref self: TContractState, new_owner: starknet::ContractAddress);

    fn grant_executors(ref self: TContractState, executors: Array<felt252>);
    fn revoke_executors(ref self: TContractState, executors: Array<felt252>);
}

#[starknet::contract]
mod ControllerResolverDelegation {
    use starknet::{get_caller_address, ContractAddress, ClassHash ,storage::Map};
    use starknet::contract_address::ContractAddressZeroable;
    use resolver::interface::{
        IResolver, IExecutorAccount, IExecutorAccountDispatcher, IExecutorAccountDispatcherTrait
    };

    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;

    // Upgradeable
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;


    #[storage]
    struct Storage {
        // name -> address
        name_owners: Map::<felt252, ContractAddress>,
        // public_key -> bool
        executors: Map::<felt252, bool>,
        // owner
        owner: ContractAddress,
        // upgradeable
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DomainToAddressUpdate: DomainToAddressUpdate,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event
    }

    #[derive(Drop, starknet::Event)]
    struct DomainToAddressUpdate {
        #[key]
        domain: Span<felt252>,
        address: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, executor_pub_key: felt252) {
        self.owner.write(owner);
        self.executors.write(executor_pub_key, true);
    }

    #[abi(embed_v0)]
    impl AdditionResolveImpl of IResolver<ContractState> {
        fn resolve(
            self: @ContractState, mut domain: Span<felt252>, field: felt252, hint: Span<felt252>
        ) -> felt252 {
            assert(domain.len() == 1, 'Domain must have a length of 1');
            assert(field == 'starknet', 'Not supported');
            self.name_owners.read(*domain.at(0)).into()
        }
    }

    #[abi(embed_v0)]
    impl ControllerResolverDelegationImpl of super::IControllerResolverDelegation<ContractState> {
        fn set_name(ref self: ContractState, name: felt252, address: ContractAddress) {
            self.assert_executor();

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

        fn set_owner(ref self: ContractState, new_owner: ContractAddress) {
            self.assert_owner();
            self.owner.write(new_owner);
        }

        fn grant_executors(ref self: ContractState, executors: Array<felt252>) {
            self.assert_owner();

            let mut executors = executors.span();
            while let Option::Some(executor) = executors
                .pop_front() {
                    self.executors.write(*executor, true);
                }
        }

        fn revoke_executors(ref self: ContractState, executors: Array<felt252>) {
            self.assert_owner();

            let mut executors = executors.span();
            while let Option::Some(executor) = executors
                .pop_front() {
                    self.executors.write(*executor, false);
                }
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.assert_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }


    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn assert_owner(self: @ContractState) {
            let caller = get_caller_address();
            let owner = self.owner.read();
            assert(caller == owner, 'caller is not owner');
        }

        fn assert_executor(self: @ContractState) {
            // retrieve caller public key
            let caller_disp = IExecutorAccountDispatcher { contract_address: get_caller_address() };
            let public_key = caller_disp.get_public_key();

            let is_executor = self.executors.read(public_key);
            assert(is_executor, 'caller is not executor');
        }
    }
}
