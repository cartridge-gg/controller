use starknet::ContractAddress;

#[starknet::interface]
trait IRegistry<TContractState> {
    fn set_registry(ref self: TContractState, registry_address: ContractAddress);
    fn has_role(self: @TContractState, role: felt252, account: ContractAddress) -> bool;

    fn assert_only_executor(self: @TContractState);
}

#[starknet::component]
pub mod RegistryComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    use openzeppelin::access::ownable::{
        OwnableComponent, OwnableComponent::InternalImpl as OwnableInternalImpl
    };

    use registry::roles::{ADMIN_ROLE, EXECUTOR_ROLE};
    use super::{IRegistry, IRegistryDispatcher, IRegistryDispatcherTrait};

    #[storage]
    struct Storage {
        Registry_address: ContractAddress,
    }

    pub mod Errors {
        pub const REGISTRY_ZERO: felt252 = 'Registry: is zero';
        pub const ONLY_EXECUTOR: felt252 = 'Registry: only executor';
    }

    #[embeddable_as(RegistryImpl)]
    impl Registry<
        TContractState,
        +Drop<TContractState>,
        +HasComponent<TContractState>,
        impl Owner: OwnableComponent::HasComponent<TContractState>,
    > of super::IRegistry<ComponentState<TContractState>> {
        fn set_registry(
            ref self: ComponentState<TContractState>, registry_address: ContractAddress
        ) {
            let mut ownable_component = get_dep_component_mut!(ref self, Owner);
            ownable_component.assert_only_owner();

            self.Registry_address.write(registry_address)
        }

        fn has_role(
            self: @ComponentState<TContractState>, role: felt252, account: ContractAddress
        ) -> bool {
            self.registry_dispatcher().has_role(role, account)
        }

        fn assert_only_executor(self: @ComponentState<TContractState>) {
            assert(self.has_role(EXECUTOR_ROLE, get_caller_address()), Errors::ONLY_EXECUTOR)
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(ref self: ComponentState<TContractState>, registry_address: ContractAddress) {
            assert(registry_address.is_non_zero(), Errors::REGISTRY_ZERO);
            self.Registry_address.write(registry_address);
        }

        fn registry_dispatcher(self: @ComponentState<TContractState>) -> IRegistryDispatcher {
            IRegistryDispatcher { contract_address: self.Registry_address.read() }
        }
    }
}
