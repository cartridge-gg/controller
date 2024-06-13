use alexandria_data_structures::array_ext::ArrayTraitExt;
use core::array::SpanTrait;
use core::array::ArrayTrait;
use core::integer::upcast;
use core::option::OptionTrait;
use core::result::ResultTrait;
use core::clone::Clone;
use core::traits::{Into, TryInto, Drop, PartialEq};
use starknet::secp256r1::Secp256r1Point;
use alexandria_math::{sha256::sha256, BitShift};
use starknet::secp256_trait::Signature;

use alexandria_encoding::base64::Base64UrlFeltEncoder;

use controller_auth::errors::{AuthnError, StoreError, RTSEIntoRTAE};
use controller_auth::helpers::{
    allow_credentials_contain_credential, UTF8Decoder, JSONClientDataParser, OriginChecker,
    concatenate, extract_r_and_s_from_array, extract_u256_from_u8_array
};

use controller_auth::types::{
    PublicKeyCredentialRequestOptions, PublicKeyCredential, PublicKey,
    PublicKeyCredentialDescriptor, AuthenticatorResponse, AuthenticatorAssertionResponse,
    AuthenticatorData, AssertionOptions
};

#[derive(Drop, Copy, Serde, PartialEq)]
struct WebauthnAssertion {
    authenticator_data: Span<u8>,
    client_data_json: Span<u8>,
    signature: Signature,
    type_offset: usize,
    challenge_offset: usize,
    challenge_length: usize,
    origin_offset: usize,
    origin_length: usize,
}

fn get_webauthn_hash(assertion: WebauthnAssertion) -> u256 {
    let WebauthnAssertion { authenticator_data, client_data_json, .. } = assertion;
    let mut client_data_hash = sha256(client_data_json.snapshot.clone());
    let mut message = authenticator_data.snapshot.clone();
    message.append_all(ref client_data_hash);
    extract_u256_from_u8_array(@sha256(message), 0).expect('invalid-hash')
}


trait WebauthnStoreTrait<T> {
    // This method should probably only return the saved credentials for them to be verified here 
    // reather than doing the chcecking itself
    // Leaving for now. TODO: revise this.
    fn verify_allow_credentials(
        self: @T, allow_credentials: @Array<PublicKeyCredentialDescriptor>
    ) -> Result<(), ()>;
    fn retrieve_public_key(
        self: @T, credential_raw_id: @Array<u8>
    ) -> Result<PublicKey, StoreError>;
}

trait WebauthnAuthenticatorTrait<T> {
    fn navigator_credentials_get(
        self: @T, options: @PublicKeyCredentialRequestOptions
    ) -> Result<PublicKeyCredential, ()>;
}


fn verify(
    type_offset: usize, // offset to 'type' field in json
    challenge_offset: usize, // offset to 'challenge' field in json
    origin_offset: usize, // offset to 'origin' field in json
    client_data_json: Span<u8>, // json with client_data as 1-byte array 
    challenge: felt252, // challenge as 1-byte
    authenticator_data: Span<u8> // authenticator data as 1-byte array
) -> Result<(), AuthnError> {
    // 11. Verify that the value of C.type is the string webauthn.get
    // Skipping for now

    // 12. Verify that the value of C.challenge equals the base64url encoding of options.challenge.
    verify_challenge(client_data_json, challenge_offset, challenge).expect('invalid-challenge');

    // 13. Verify that the value of C.origin matches the Relying Party's origin.
    // Skipping for now.

    // 15. Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID expected by the Relying Party.
    // Skipping for now. This protects against authenticator cloning which is generally not
    // a concern of blockchain wallets today.
    // Authenticator Data layout looks like: [ RP ID hash - 32 bytes ] [ Flags - 1 byte ] [ Counter - 4 byte ] [ ... ]
    // See: https://w3c.github.io/webauthn/#sctn-authenticator-data

    // 16. Verify that the User Present (0) and User Verified (2) bits of the flags in authData is set.
    let ad: AuthenticatorData = match authenticator_data.try_into() {
        Option::Some(x) => x,
        Option::None => { return AuthnError::UserFlagsMismatch.into(); }
    };
    verify_user_flags(@ad, true).expect('invalid-user-flags');
    Result::Ok(())
}

fn verify_challenge(
    client_data_json: Span<u8>, challenge_offset: usize, challenge: felt252
) -> Result<(), AuthnError> {
    let mut i: usize = 0;
    let mut encoded = Base64UrlFeltEncoder::encode(challenge);
    let encoded_len: usize = encoded.len();
    loop {
        if i >= encoded_len - 1 {
            break Result::Ok(());
        }
        if *client_data_json.at(challenge_offset + i) != *encoded.at(i) {
            break Result::Err(AuthnError::ChallengeMismatch);
        }
        i += 1_usize;
    }
}

// Steps 6. and 7. of the verify_authentication_assertion(..) method
// This should be exactly according to the specification
// There are basically two conditions for this method to succed:
// 1. There are at least two user identifiers
// 2. All available user identifiers should yeld the same public key 
fn find_and_verify_credential_source<
    // Store:
    StoreT, impl WebauthnStoreTImpl: WebauthnStoreTrait<StoreT>, impl SDrop: Drop<StoreT>
>(
    store: @StoreT,
    preidentified_user_handle: @Option<Array<u8>>,
    credential: @PublicKeyCredential,
    response: @AuthenticatorAssertionResponse
) -> Result<PublicKey, AuthnError> {
    let pk = match @preidentified_user_handle {
        Option::Some(user) => {
            let pk_1 = RTSEIntoRTAE::<
                PublicKey
            >::into(store.retrieve_public_key(credential.raw_id))?;
            let pk_2 = RTSEIntoRTAE::<PublicKey>::into(store.retrieve_public_key(*user))?;
            if pk_1 != pk_2 {
                return AuthnError::IdentifiedUsersMismatch.into();
            };
            match response.user_handle {
                Option::Some(handle) => {
                    let pk_3 = RTSEIntoRTAE::<PublicKey>::into(store.retrieve_public_key(handle))?;
                    if pk_1 != pk_3 {
                        return AuthnError::IdentifiedUsersMismatch.into();
                    };
                },
                Option::None => (),
            }
            pk_1
        },
        Option::None => {
            let pk_1 = RTSEIntoRTAE::<
                PublicKey
            >::into(store.retrieve_public_key(credential.raw_id))?;
            let pk_2 = match response.user_handle {
                Option::Some(_handle) => RTSEIntoRTAE::<
                    PublicKey
                >::into(store.retrieve_public_key(credential.raw_id))?,
                Option::None => { return AuthnError::IdentifiedUsersMismatch.into(); },
            };
            if pk_1 != pk_2 {
                return AuthnError::IdentifiedUsersMismatch.into();
            };
            pk_1
        }
    };
    Result::Ok(pk)
}

// Step 15
// Expands auth_data crunched into an array to an AuthenticatorData object
fn expand_auth_data_and_verify_rp_id_hash(
    auth_data: Span<u8>, expected_rp_id: Array<u8>
) -> Result<AuthenticatorData, AuthnError> {
    let auth_data_struct: AuthenticatorData = match auth_data.try_into() {
        Option::Some(ad) => ad,
        Option::None => { return AuthnError::InvalidAuthData.into(); }
    };
    if sha256(expected_rp_id) == auth_data_struct.rp_id_hash {
        Result::Ok(auth_data_struct)
    } else {
        AuthnError::RelyingPartyIdHashMismatch.into()
    }
}

// Steps 16 and 17 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
fn verify_user_flags(
    auth_data: @AuthenticatorData, force_user_verified: bool
) -> Result<(), AuthnError> {
    let flags: u128 = upcast(*auth_data.flags);
    let mask: u128 = upcast(
        if force_user_verified {
            1_u8 + 4_u8 // 10100000
        } else {
            1_u8 // 10000000
        }
    );
    if (flags & mask) == mask {
        Result::Ok(())
    } else {
        AuthnError::UserFlagsMismatch.into()
    }
}

// https://www.w3.org/TR/webauthn/#sctn-authenticator-data
impl ImplArrayu8TryIntoAuthData of TryInto<Span<u8>, AuthenticatorData> {
    // Construct the AuthenticatorData object from a ByteArray
    // Authenticator Data layout looks like: 
    // [ RP ID hash - 32 bytes ] [ Flags - 1 byte ] [ Counter - 4 byte ] [ ... ]
    fn try_into(self: Span<u8>) -> Option<AuthenticatorData> {
        if self.len() < 37 {
            return Option::None;
        };
        // There is some problem regarding the moving of self
        // For now this problem exceeds my mental capacity
        // TODO: Remove clone()
        let cloned = self.clone();
        let mut rp_id_hash: Array<u8> = ArrayTrait::new();
        let mut counter = 0_usize;
        loop {
            if counter == 32 {
                break;
            };
            rp_id_hash.append(*cloned[counter]);
            counter += 1;
        };

        let flags = *self[32];
        let mut sign_count = 0_u32;
        sign_count = sign_count | BitShift::shl((*self[33]).into(), 3 * 8);
        sign_count = sign_count | BitShift::shl((*self[34]).into(), 2 * 8);
        sign_count = sign_count | BitShift::shl((*self[35]).into(), 1 * 8);
        sign_count = sign_count | BitShift::shl((*self[36]).into(), 0 * 8);
        Option::Some(AuthenticatorData { rp_id_hash, flags, sign_count })
    }
}
