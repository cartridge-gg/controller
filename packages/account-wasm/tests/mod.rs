use account_sdk::signers::webauthn::{DeviceSigner, P256r1Signer, WebauthnAccountSigner};
use starknet::macros::felt;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_webauth_wasm() {
    let origin = "localhost".to_string();
    let rp_id = "cartridge".to_string();
    let username = "foo".to_string();

    let account = DeviceSigner::register(origin.clone(), rp_id.clone(), username, &[])
        .await
        .unwrap();

    let challenge = felt!("0x0169af1f6f99d35e0b80e0140235ec4a2041048868071a8654576223934726f5");
    let challenge_bytes = challenge.to_bytes_be();
    let _ = account.sign(&challenge_bytes).await.unwrap();

    // let args = VerifyWebauthnSignerArgs::from_response(
    //     origin.to_string(),
    //     challenge_bytes.to_vec(),
    //     assertion,
    // );

    // let client_data = String::from_utf8(args.client_data_json).unwrap();
    // console::log_1(&client_data.into());

    let signer = P256r1Signer::random(origin.to_string(), rp_id);
    let _ = signer.sign(&challenge_bytes).await.unwrap();

    // let args = VerifyWebauthnSignerArgs::from_response(
    //     origin.to_string(),
    //     challenge_bytes.to_vec(),
    //     assertion,
    // );

    // let client_data = String::from_utf8(args.client_data_json).unwrap();

    // console::log_1(&client_data.into());
}
