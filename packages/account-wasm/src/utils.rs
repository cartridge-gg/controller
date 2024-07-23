use std::collections::HashMap;

use starknet::accounts::Call;
use starknet::core::crypto::compute_hash_on_elements;
use starknet::core::types::Felt;
use starknet::core::utils::{cairo_short_string_to_felt, get_selector_from_name};

use crate::constants::{ACCOUNT_CLASS_HASH, ADDR_BOUND, PREFIX_CONTRACT_ADDRESS};
use crate::types::policy::JsPolicy;
use crate::Controller;

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

pub fn calculate_contract_address(
    salt: Felt,
    class_hash: Felt,
    constructor_calldata: &[Felt],
) -> Felt {
    compute_hash_on_elements(&[
        PREFIX_CONTRACT_ADDRESS,
        Felt::ZERO,
        salt,
        class_hash,
        compute_hash_on_elements(constructor_calldata),
    ])
    .mod_floor(&ADDR_BOUND)
}

pub fn calculate_account_address(username: &str, account: &Controller) -> Felt {
    calculate_contract_address(
        cairo_short_string_to_felt(&username.to_lowercase()).unwrap(),
        Felt::from_hex(ACCOUNT_CLASS_HASH).unwrap(),
        &account.get_constructor_calldata(),
    )
}
