#[starknet::interface]
trait IExecutable<TContractState> {
    fn grant_executors(ref self: TContractState, pubkeys: Span<felt252>);
    fn revoke_executors(ref self: TContractState, pubkeys: Span<felt252>);
}

#[starknet::interface]
trait IExecutorAccount<TContractState> {
    fn get_public_key(self: @TContractState) -> felt252;
}

#[starknet::component]
pub mod ExecutableComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::Map;
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess,
        StorageMapWriteAccess
    };

    use openzeppelin::access::ownable::{
        OwnableComponent, OwnableComponent::InternalImpl as OwnableInternalImpl
    };

    use super::{IExecutorAccount, IExecutorAccountDispatcher, IExecutorAccountDispatcherTrait};

    #[storage]
    pub struct Storage {
        Executable_pubkeys: Map::<felt252, bool>,
    }

    #[event]
    #[derive(Drop, PartialEq, starknet::Event)]
    pub enum Event {
        ExecutorGranted: ExecutorGranted,
        ExecutorRevoked: ExecutorRevoked
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct ExecutorGranted {
        #[key]
        pub pubkey: felt252,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct ExecutorRevoked {
        #[key]
        pub pubkey: felt252,
    }

    pub mod Errors {
        pub const NOT_EXECUTOR: felt252 = 'Caller is not executor';
    }

    #[embeddable_as(ExecutableImpl)]
    impl Executable<
        TContractState,
        +HasComponent<TContractState>,
        impl Ownable: OwnableComponent::HasComponent<TContractState>
    > of super::IExecutable<ComponentState<TContractState>> {
        fn grant_executors(ref self: ComponentState<TContractState>, mut pubkeys: Span<felt252>) {
            self.assert_only_owner();

            self._grant_executors(pubkeys);
        }

        fn revoke_executors(ref self: ComponentState<TContractState>, mut pubkeys: Span<felt252>) {
            self.assert_only_owner();

            self._revoke_executors(pubkeys);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Ownable: OwnableComponent::HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(ref self: ComponentState<TContractState>, mut pubkeys: Span<felt252>) {
            self._grant_executors(pubkeys);
        }

        fn _grant_executors(ref self: ComponentState<TContractState>, mut pubkeys: Span<felt252>) {
            while let Option::Some(pubkey) = pubkeys.pop_front() {
                self.Executable_pubkeys.write(*pubkey, true);
                self.emit(ExecutorGranted { pubkey: *pubkey });
            }
        }

        fn _revoke_executors(ref self: ComponentState<TContractState>, mut pubkeys: Span<felt252>) {
            while let Option::Some(pubkey) = pubkeys.pop_front() {
                self.Executable_pubkeys.write(*pubkey, false);
                self.emit(ExecutorRevoked { pubkey: *pubkey });
            }
        }

        fn assert_only_owner(self: @ComponentState<TContractState>) {
            let ownable = get_dep_component!(self, Ownable);
            ownable.assert_only_owner();
        }

        fn assert_only_executor(self: @ComponentState<TContractState>) {
            // retrieve caller public key
            let caller_disp = IExecutorAccountDispatcher { contract_address: get_caller_address() };
            let pubkey = caller_disp.get_public_key();

            let is_executor = self.Executable_pubkeys.read(pubkey);
            assert(is_executor, Errors::NOT_EXECUTOR);
        }
    }
}
