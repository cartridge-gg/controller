
use account_sdk::{webauthn_signer::{cairo_args::VerifyWebauthnSignerArgs, credential, signers::{device::{DeviceError, DeviceSigner}, p256r1::P256r1Signer, Signer}}};
use account_wasm::WebauthnAccount;
use starknet::macros::felt;
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::*;
use wasm_webauthn::*;
use web_sys::{
    console,
};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_webauth_wasm() {

    let origin = "localhost";
    let account = DeviceSigner::register(
        origin.to_string(), 
        "cartridge".to_string(), 
        &vec![]).await.unwrap();

    let challenge = felt!("0x0169af1f6f99d35e0b80e0140235ec4a2041048868071a8654576223934726f5");
    let challenge_bytes = challenge.to_bytes_be();
    let assertion = account.sign(&challenge_bytes).await.unwrap();

    let args = VerifyWebauthnSignerArgs::from_response(
        origin.to_string(), 
        challenge_bytes.to_vec(), 
        assertion
    );

    let client_data = String::from_utf8(args.client_data_json).unwrap();
    console::log_1(&client_data.into());



    let signer = P256r1Signer::random(origin.to_string());
    let assertion = signer.sign(&challenge_bytes).await.unwrap();

    let args = VerifyWebauthnSignerArgs::from_response(
        origin.to_string(), 
        challenge_bytes.to_vec(), 
        assertion
    );

    let client_data = String::from_utf8(args.client_data_json).unwrap();


    console::log_1(&client_data.into());
}
