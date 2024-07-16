use std::collections::HashMap;

use starknet::accounts::Call;
use starknet::core::types::Felt;
use starknet::core::utils::get_selector_from_name;

use crate::types::policy::JsPolicy;

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
