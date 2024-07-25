use std::fmt::Error;

use crate::{
    constants::ACCOUNT_CLASS_HASH, paymaster::convert_to_snake_case, types::policy::JsPolicy,
    utils::policies_match, CartridgeAccount,
};
use serde_json::{self, json};
use starknet::{
    accounts::Call,
    core::{
        crypto::compute_hash_on_elements,
        types::{Felt, NonZeroFelt},
        utils::{cairo_short_string_to_felt, get_selector_from_name},
    },
};

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

fn create_test_account(
    username: &str,
    address: &str,
    credential_id: &str,
    public_key: &str,
) -> CartridgeAccount {
    CartridgeAccount::new(
        "http://localhost:8000/x/starknet/mainnet".to_string(),
        "0x534e5f4d41494e".to_string(),
        address.to_string(),
        "localhost".to_string(),
        "http://localhost:3001".to_string(),
        username.to_string(),
        credential_id.to_string(),
        public_key.to_string(),
    )
    .map_err(|_| Error)
    .unwrap()
}

#[test]
fn test_convert_to_snake_case_simple() {
    let input = json!({
        "someKey": "value",
        "anotherKey": 123
    });
    let expected = json!({
        "some_key": "value",
        "another_key": 123
    });
    assert_eq!(convert_to_snake_case(input), expected);
}

#[test]
fn test_convert_to_snake_case_nested() {
    let input = json!({
        "outerKey": {
            "innerKey": "value",
            "anotherInnerKey": [1, 2, 3]
        },
        "arrayKey": [
            {"nestedKey": "nestedValue"},
            {"anotherNestedKey": 456}
        ]
    });
    let expected = json!({
        "outer_key": {
            "inner_key": "value",
            "another_inner_key": [1, 2, 3]
        },
        "array_key": [
            {"nested_key": "nestedValue"},
            {"another_nested_key": 456}
        ]
    });
    assert_eq!(convert_to_snake_case(input), expected);
}

#[test]
fn test_policy_match() {
    // Test data
    let call1 = Call {
        to: Felt::from_hex("0x123").unwrap(),
        selector: get_selector_from_name("method1").unwrap(),
        calldata: vec![Felt::from_hex("0x1").unwrap()],
    };

    let call2 = Call {
        to: Felt::from_hex("0x456").unwrap(),
        selector: get_selector_from_name("method2").unwrap(),
        calldata: vec![Felt::from_hex("0x2").unwrap()],
    };

    let calls = vec![call1.clone(), call2.clone()];

    let policy1 = JsPolicy {
        target: String::from("0x123"),
        method: String::from("method1"),
    };

    let policy2 = JsPolicy {
        target: String::from("0x456"),
        method: String::from("method2"),
    };

    let policies = vec![policy1.clone(), policy2.clone()];

    // Test case where policies match
    assert!(policies_match(&calls, &policies), "Policies should match");

    // Test case where policies do not match
    let policy_mismatch = JsPolicy {
        target: String::from("0x789"),
        method: String::from("method3"),
    };

    let policies_mismatch = vec![policy1, policy_mismatch];
    assert!(
        !policies_match(&calls, &policies_mismatch),
        "Policies should not match"
    );

    // Test case where calls are empty
    let empty_calls: Vec<Call> = vec![];
    assert!(
        policies_match(&empty_calls, &policies),
        "Empty calls should match"
    );

    // Test case where policies are empty
    let empty_policies: Vec<JsPolicy> = vec![];
    assert!(
        !policies_match(&calls, &empty_policies),
        "Empty policies should not match"
    );

    // Test case where both are empty
    assert!(
        policies_match(&empty_calls, &empty_policies),
        "Both empty should match"
    );
}

#[test]
fn test_verify_address() {
    let username = "TestUseR";
    let address = "0x5f530a64149817666a93e45df896d368056b2c680c56c5e23cfffa5fb3591c4";
    let credential_id = "juIx8zbazZbAvJIkyyGXZhlaQhysJqqRau4E9F6K7_uJesonwOd8oBcjNI3xcMSYUFJttmolDw0IIZlp4NXAdR16l8HPmYSQsRx8_Vfb2jGxJe5mtKBX0oH73GAdrXmQ";
    let public_key = "pQECAyYgASFYICgsU0B9_E9r77VDI-mRT8ljHOFK4cLu8zjbJ64X14KVIlgg__E_pfxdQMb_DhKpBdGhmp7VcTetrv5qxNuIVPUutvE";

    let account = create_test_account(username, address, credential_id, public_key);

    let calculated_address = calculate_contract_address(
        cairo_short_string_to_felt(&username.to_lowercase()).unwrap(),
        Felt::from_hex(ACCOUNT_CLASS_HASH).unwrap(),
        &account.get_constructor_calldata(),
    );

    assert_eq!(
        calculated_address,
        Felt::from_hex(address).unwrap(),
        "Address does not match calculated"
    );
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen_test]
async fn test_webauth_wasm() {
    use account_sdk::signers::webauthn::{
        DeviceSigner, InternalWebauthnSigner, WebauthnAccountSigner,
    };
    use starknet::macros::felt;

    let origin = "localhost".to_string();
    let rp_id = "cartridge".to_string();
    let username = "foo".to_string();

    let account = DeviceSigner::register(origin.clone(), rp_id.clone(), username, &[])
        .await
        .unwrap();

    let challenge = felt!("0x0169af1f6f99d35e0b80e0140235ec4a2041048868071a8654576223934726f5");
    let challenge_bytes = challenge.to_bytes_be();
    let _ = account.sign(&challenge_bytes).await.unwrap();
    let signer = InternalWebauthnSigner::random(origin.to_string(), rp_id);
    let _ = signer.sign(&challenge_bytes).await.unwrap();
}
