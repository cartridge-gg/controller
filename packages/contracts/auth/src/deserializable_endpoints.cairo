use controller_auth::types::PublicKey;
use starknet::secp256r1::Secp256r1Point;
use controller_auth::errors::{AuthnError, RTSEIntoRTAE, AuthnErrorIntoFelt252};
use core::traits::Into;
use controller_auth::webauthn::ImplArrayu8TryIntoAuthData;
use controller_auth::types::AuthenticatorData;
use controller_auth::helpers::extract_u256_from_u8_array;


fn expand_auth_data_endpoint(auth_data: Array<u8>) -> AuthenticatorData {
    let data: Option<AuthenticatorData> = ImplArrayu8TryIntoAuthData::try_into(auth_data.span());
    return data.unwrap();
}

fn extract_u256_from_u8_array_endpoint(bytes: Array<u8>, offset: u32) -> Option<u256> {
    extract_u256_from_u8_array(@bytes, offset)
}
