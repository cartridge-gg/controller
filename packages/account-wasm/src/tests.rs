use crate::{paymaster::convert_to_snake_case, types::policy::JsPolicy, utils::policies_match};
use serde_json::{self, json};
use starknet::{
    accounts::Call,
    core::{types::Felt, utils::get_selector_from_name},
};

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

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen_test]
async fn test_webauth_wasm() {
    use account_sdk::signers::webauthn::{
        DeviceSigner, InternalWebauthnSigner, WebauthnAccountSigner,
    };
    use starknet::macros::felt;
    use wasm_bindgen_test::*;

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
