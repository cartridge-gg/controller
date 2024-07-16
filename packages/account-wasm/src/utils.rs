use std::collections::HashMap;

use starknet::accounts::Call;
use starknet::core::crypto::compute_hash_on_elements;
use starknet::core::types::{Felt, NonZeroFelt};
use starknet::core::utils::get_selector_from_name;

use crate::types::policy::JsPolicy;

const PREFIX_CONTRACT_ADDRESS: Felt = Felt::from_raw([
    533439743893157637,
    8635008616843941496,
    17289941567720117366,
    3829237882463328880,
]);

const ADDR_BOUND: NonZeroFelt = NonZeroFelt::from_raw([
    576459263475590224,
    18446744073709255680,
    160989183,
    18446743986131443745,
]);


pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn policies_match(calls: &[Call], policies: &[JsPolicy]) -> bool {
    let policy_map: HashMap<Felt, &JsPolicy> = policies
        .iter()
        .map(|policy| {
            (
                get_selector_from_name(&policy.method).expect("selector from name"),
                policy,
            )
        })
        .collect();

    calls
        .iter()
        .all(|call| policy_map.contains_key(&call.selector))
}

pub fn calculate_contract_address(salt: Felt, class_hash: Felt, constructor_calldata: &[Felt]) -> Felt {
    compute_hash_on_elements(&[
        PREFIX_CONTRACT_ADDRESS,
        Felt::ZERO,
        salt,
        class_hash,
        compute_hash_on_elements(constructor_calldata),
    ])
    .mod_floor(&ADDR_BOUND)
}