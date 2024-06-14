use core::result::ResultTrait;
use core::debug::PrintTrait;
use core::option::OptionTrait;
use controller_auth::webauthn::verify_user_flags;
use controller_auth::types::AuthenticatorData;
use core::array::ArrayTrait;

#[test]
#[available_gas(20000000000)]
fn test_verify_user_flags() {
    let ad = AuthenticatorData { rp_id_hash: ArrayTrait::new(), flags: 0b00000001, sign_count: 0 };
    verify_user_flags(@ad, false).unwrap();
    match verify_user_flags(@ad, true) {
        Result::Ok => assert(false, 'should fail'),
        Result::Err(_) => ()
    };
    let ad_verified = AuthenticatorData {
        rp_id_hash: ArrayTrait::new(), flags: 0b00000101, sign_count: 0
    };
    verify_user_flags(@ad_verified, false).unwrap();
    verify_user_flags(@ad_verified, true).unwrap();
    let ad_wrong = AuthenticatorData {
        rp_id_hash: ArrayTrait::new(), flags: 0b11111010, sign_count: 0
    };
    match verify_user_flags(@ad_wrong, false) {
        Result::Ok => assert(false, 'should fail'),
        Result::Err(_) => ()
    };
    match verify_user_flags(@ad_wrong, true) {
        Result::Ok => assert(false, 'should fail'),
        Result::Err(_) => ()
    };
}
