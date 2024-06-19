// This file is part of a project that is licensed under the GNU General Public License v3.0.
// This particular file, `outside_execution.cairo`, is distributed under the same license.
// You can redistribute it and/or modify it under the terms of the GNU General Public License 
// as published by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This file is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this file.  If not, see <https://www.gnu.org/licenses/>.

// This file is based on:
// https://github.com/argentlabs/argent-contracts-starknet/blob/main/src/common/outside_execution.cairo

/// @dev If you are using this component you have to support it in the `supports_interface` function
// This is achieved by adding outside_execution::ERC165_OUTSIDE_EXECUTION_INTERFACE_ID
#[starknet::component]
mod outside_execution_component {
    use controller::outside_execution::{
        outside_execution_hash::get_message_hash_rev_1,
        interface::{OutsideExecution, IOutsideExecutionCallback, IOutsideExecution}
    };
    use hash::{HashStateTrait, HashStateExTrait};
    use pedersen::PedersenTrait;
    use starknet::{
        get_caller_address, get_contract_address, get_block_timestamp, get_tx_info, account::Call
    };

    #[storage]
    struct Storage {
        /// Keeps track of used nonces for outside transactions (`execute_from_outside`)
        outside_nonces: LegacyMap<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    #[embeddable_as(OutsideExecutionImpl)]
    impl ImplOutsideExecution<
        TContractState,
        +HasComponent<TContractState>,
        +IOutsideExecutionCallback<TContractState>,
        +Drop<TContractState>
    > of IOutsideExecution<ComponentState<TContractState>> {
        fn execute_from_outside_v2(
            ref self: ComponentState<TContractState>,
            outside_execution: OutsideExecution,
            signature: Span<felt252>
        ) -> Array<Span<felt252>> {
            let hash = get_message_hash_rev_1(@outside_execution);
            self.assert_valid_outside_execution(outside_execution, hash, signature)
        }

        fn get_outside_execution_message_hash_rev_1(
            self: @ComponentState<TContractState>, outside_execution: OutsideExecution
        ) -> felt252 {
            get_message_hash_rev_1(@outside_execution)
        }

        fn is_valid_outside_execution_nonce(
            self: @ComponentState<TContractState>, nonce: felt252
        ) -> bool {
            !self.outside_nonces.read(nonce)
        }
    }

    #[generate_trait]
    impl Internal<
        TContractState,
        +HasComponent<TContractState>,
        +IOutsideExecutionCallback<TContractState>,
        +Drop<TContractState>
    > of InternalTrait<TContractState> {
        fn assert_valid_outside_execution(
            ref self: ComponentState<TContractState>,
            outside_execution: OutsideExecution,
            outside_tx_hash: felt252,
            signature: Span<felt252>
        ) -> Array<Span<felt252>> {
            if outside_execution.caller.into() != 'ANY_CALLER' {
                assert(get_caller_address() == outside_execution.caller, 'outside-exec/invalid-caller');
            }

            let block_timestamp = get_block_timestamp();
            assert(
                outside_execution.execute_after < block_timestamp
                    && block_timestamp < outside_execution.execute_before,
                'outside-exec/invalid-timestamp'
            );
            let nonce = outside_execution.nonce;
            assert(!self.outside_nonces.read(nonce), 'duplicated-outside-nonce');
            self.outside_nonces.write(nonce, true);
            let mut state = self.get_contract_mut();
            state.execute_from_outside_callback(outside_execution.calls, outside_tx_hash, signature)
        }
    }
}

