const DECLARE_SELECTOR: felt252 = selector!("__declare_transaction__");

use starknet::{ContractAddress, account::Call};

fn assert_no_self_call(mut calls: Span<Call>, self: ContractAddress) {
    while let Option::Some(call) = calls
        .pop_front() {
            if *call.selector != DECLARE_SELECTOR {
                assert(*call.to != self, 'argent/no-multicall-to-self')
            }
        }
}
