// This file is part of a project that is licensed under the GNU General Public License v3.0.
// This particular file, `outside_execution_hash.cairo`, is distributed under the same license.
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

use controller::session::hash::{StarknetDomain, IStructHashRev1, get_message_hash_rev_1_with_precalc,};
use controller::outside_execution::interface::{OutsideExecution};
use hash::{HashStateTrait, HashStateExTrait};
use pedersen::PedersenTrait;
use poseidon::{poseidon_hash_span, hades_permutation, HashState};
use starknet::{get_tx_info, get_contract_address, account::Call};

const MAINNET_FIRST_HADES_PERMUTATION: (felt252, felt252, felt252) =
    (
        466771826862796654720497916898873955545764255168198993180536052682392700659,
        8304264822580609485631142291553027424455705068469035347025093264477380363,
        105288646621191754218635047234198033888793063910621244998394884076270002325
    );

const SEPOLIA_FIRST_HADES_PERMUTATION: (felt252, felt252, felt252) =
    (
        745540723582226592436632693000411598770476874516739165104583972640400378932,
        62154301810125581556071585758541948884661504815060895665449539162589631391,
        3469680712295219559397768335134989296665687247431765753301038002536467417786
    );


const OUTSIDE_EXECUTION_TYPE_HASH_REV_1: felt252 =
    selector!(
        "\"OutsideExecution\"(\"Caller\":\"ContractAddress\",\"Nonce\":\"felt\",\"Execute After\":\"u128\",\"Execute Before\":\"u128\",\"Calls\":\"Call*\")\"Call\"(\"To\":\"ContractAddress\",\"Selector\":\"selector\",\"Calldata\":\"felt*\")"
    );

const CALL_TYPE_HASH_REV_1: felt252 =
    selector!(
        "\"Call\"(\"To\":\"ContractAddress\",\"Selector\":\"selector\",\"Calldata\":\"felt*\")"
    );


impl StructHashCallRev1 of IStructHashRev1<Call> {
    fn get_struct_hash_rev_1(self: @Call) -> felt252 {
        poseidon_hash_span(
            array![
                CALL_TYPE_HASH_REV_1,
                (*self.to).into(),
                *self.selector,
                poseidon_hash_span(*self.calldata)
            ]
                .span()
        )
    }
}

impl StructHashOutsideExecutionRev1 of IStructHashRev1<OutsideExecution> {
    fn get_struct_hash_rev_1(self: @OutsideExecution) -> felt252 {
        let self = *self;
        let mut calls_span = self.calls;
        let mut hashed_calls = array![];

        while let Option::Some(call) = calls_span
            .pop_front() {
                hashed_calls.append(call.get_struct_hash_rev_1());
            };
        poseidon_hash_span(
            array![
                OUTSIDE_EXECUTION_TYPE_HASH_REV_1,
                self.caller.into(),
                self.nonce,
                self.execute_after.into(),
                self.execute_before.into(),
                poseidon_hash_span(hashed_calls.span()),
            ]
                .span()
        )
    }
}


fn get_message_hash_rev_1(self: @OutsideExecution) -> felt252 {
    // Version and Revision should be shortstring '1' and not felt 1 for SNIP-9 due to a mistake
    // in the Braavos contracts and has been copied for compatibility.
    // Revision will also be a number for all SNIP12-rev1 signatures because of the same issue

    let chain_id = get_tx_info().unbox().chain_id;
    if chain_id == 'SN_MAIN' {
        return get_message_hash_rev_1_with_precalc(MAINNET_FIRST_HADES_PERMUTATION, *self);
    }
    if chain_id == 'SN_SEPOLIA' {
        return get_message_hash_rev_1_with_precalc(SEPOLIA_FIRST_HADES_PERMUTATION, *self);
    }
    let domain = StarknetDomain {
        name: 'Account.execute_from_outside', version: 1, chain_id, revision: 1
    };
    poseidon_hash_span(
        array![
            'StarkNet Message',
            domain.get_struct_hash_rev_1(),
            get_contract_address().into(),
            (*self).get_struct_hash_rev_1(),
        ]
            .span()
    )
}

