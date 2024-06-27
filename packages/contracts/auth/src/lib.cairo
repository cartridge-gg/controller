mod webauthn;
mod eip191;
mod types;
mod helpers;
mod errors;
mod deserializable_endpoints;
mod signer;

#[cfg(test)]
mod tests;

const WEBAUTHN_V1: felt252 = 'Webauthn v1';

const DECLARE_SELECTOR: felt252 = selector!("__declare_transaction__");

use starknet::{get_contract_address, get_caller_address, ContractAddress, account::Call};

#[inline(always)]
fn assert_only_self() {
    assert(get_contract_address() == get_caller_address(), 'only-self');
}

fn assert_no_self_call(mut calls: Span<Call>, self: ContractAddress) {
    while let Option::Some(call) = calls
        .pop_front() {
            if *call.selector != DECLARE_SELECTOR {
                assert(*call.to != self, 'no-multicall-to-self')
            }
        }
}
