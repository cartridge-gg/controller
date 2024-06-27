use crate::paymaster::convert_to_snake_case;
use serde_json::{self, json};

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
