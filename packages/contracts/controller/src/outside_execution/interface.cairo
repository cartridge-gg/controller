// This file is part of a project that is licensed under the GNU General Public License v3.0.
// This particular file, `interface.cairo`, is distributed under the same license.
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

use hash::{HashStateExTrait, HashStateTrait};
use pedersen::PedersenTrait;
use starknet::{ContractAddress, get_contract_address, get_tx_info, account::Call};

// Interface ID for revision 1 of the OutsideExecute interface
// see https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-9.md
// calculated using https://github.com/ericnordelo/src5-rs
const ERC165_OUTSIDE_EXECUTION_INTERFACE_ID_REV_1: felt252 =
    0x1d1144bb2138366ff28d8e9ab57456b1d332ac42196230c3a602003c89872;

/// @notice As defined in SNIP-9 https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-9.md
/// @param caller Only the address specified here will be allowed to call `execute_from_outside`
/// As an exception, to opt-out of this check, the value 'ANY_CALLER' can be used
/// @param nonce It can be any value as long as it's unique. Prevents signature reuse
/// @param execute_after `execute_from_outside` only succeeds if executing after this time
/// @param execute_before `execute_from_outside` only succeeds if executing before this time
/// @param calls The calls that will be executed by the Account
/// Using `Call` here instead of re-declaring `OutsideCall` to avoid the conversion
#[derive(Copy, Drop, Serde)]
struct OutsideExecution {
    caller: ContractAddress,
    nonce: felt252,
    execute_after: u64,
    execute_before: u64,
    calls: Span<Call>
}

/// @notice get_outside_execution_message_hash_rev_* is not part of the standard interface
#[starknet::interface]
trait IOutsideExecution<TContractState> {
    /// @notice Outside execution using SNIP-12 Rev 1 
    fn execute_from_outside_v2(
        ref self: TContractState, outside_execution: OutsideExecution, signature: Span<felt252>
    ) -> Array<Span<felt252>>;

    /// Get the status of a given nonce, true if the nonce is available to use
    fn is_valid_outside_execution_nonce(self: @TContractState, nonce: felt252) -> bool;

    /// Get the message hash for some `OutsideExecution` rev 1 following Eip712. Can be used to know what needs to be signed
    fn get_outside_execution_message_hash_rev_1(
        self: @TContractState, outside_execution: OutsideExecution
    ) -> felt252;
}

/// This trait must be implemented when using the component `outside_execution_component` (This is enforced by the compiler)
trait IOutsideExecutionCallback<TContractState> {
    /// @notice Callback performed after checking the OutsideExecution is valid
    /// @dev Make the correct access control checks in this callback
    /// @param calls The calls to be performed 
    /// @param outside_execution_hash The hash of OutsideExecution
    /// @param signature The signature that the user gave for this transaction
    #[inline(always)]
    fn execute_from_outside_callback(
        ref self: TContractState,
        calls: Span<Call>,
        outside_execution_hash: felt252,
        signature: Span<felt252>,
    ) -> Array<Span<felt252>>;
}
