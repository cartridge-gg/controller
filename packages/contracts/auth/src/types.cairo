use core::starknet::SyscallResultTrait;
use core::option::OptionTrait;
use core::clone::Clone;
use core::clone::TCopyClone;
use core::serde::Serde;
use core::starknet::secp256_trait::Secp256PointTrait;
use core::traits::Into;
use core::array::ArrayTrait;
use core::integer::upcast;

use core::result::ResultTrait;
use starknet::secp256r1;
use starknet::secp256r1::Secp256r1Point;
use starknet::secp256r1::Secp256r1Impl;
use starknet::secp256r1::Secp256r1PointImpl;

use alexandria_math::sha256::sha256;
use alexandria_encoding::base64::Base64UrlEncoder;
use alexandria_math::BitShift;

// https://webidl.spec.whatwg.org/#idl-DOMString
type DomString = Array<u8>;
// https://webidl.spec.whatwg.org/#idl-USVString
type USVString = Array<u16>;


// https://www.w3.org/TR/webauthn/#dictionary-credential-descriptor
#[derive(Drop, Clone)]
struct PublicKeyCredentialDescriptor {
    // Puprosely not enumerated, see https://www.w3.org/TR/webauthn/#sct-domstring-backwards-compatibility
    type_: DomString,
    // Probabilistically unique identifier
    // There is some ambiguity whether it's u8 or u16, see:
    // u16: (USVString) https://w3c.github.io/webappsec-credential-management/#dom-credential-id 
    // u8/u16: (BufferSource) https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor
    // u16 seems resoanable and it probably doesn't matter 
    id: Array<u16>,
    transports: Option<DomString>
}

// https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrequestoptions
#[derive(Drop)]
struct PublicKeyCredentialRequestOptions {
    challenge: DomString,
    allow_credentials: Option<Array<PublicKeyCredentialDescriptor>>
// TODO: Add other fields
}


//https://w3c.github.io/webappsec-credential-management/#credential
#[derive(Drop)]
struct Credential {
    id: USVString,
    type_: DomString,
}


// https://www.w3.org/TR/webauthn/#iface-pkcredential
// "inherits" from Credential
#[derive(Drop, Clone)]
struct PublicKeyCredential {
    id: USVString,
    type_: DomString,
    raw_id: Array<u8>,
    response: AuthenticatorResponse
}

// https://www.w3.org/TR/webauthn/#authenticatorresponse
#[derive(Drop, Clone)]
struct AuthenticatorResponseBase {
    // The exact JSON serialization MUST be preserved, 
    // as the hash of the serialized client data has been computed over it.
    client_data_json: Array<u8>
}

#[derive(Drop, Clone)]
enum AuthenticatorResponse {
    Attestation: AuthenticatorAttestationResponse,
    Assertion: AuthenticatorAssertionResponse
}

// https://www.w3.org/TR/webauthn/#iface-authenticatorattestationresponse
// "inherits" from AuthenticatorResponseBase
#[derive(Drop, Clone)]
struct AuthenticatorAttestationResponse {
    client_data_json: Array<u8>,
    attestation_object: Array<u8>,
    transports: Array<DomString>
}

// https://www.w3.org/TR/webauthn/#authenticatorassertionresponse
// "inherits" from AuthenticatorResponseBase
#[derive(Drop, Clone)]
struct AuthenticatorAssertionResponse {
    client_data_json: Array<u8>,
    authenticator_data: Array<u8>,
    signature: Array<u8>,
    user_handle: Option<Array<u8>>
}

// https://www.w3.org/TR/webauthn/#client-data
#[derive(Drop, Clone)]
struct CollectedClientData {
    type_: DomString,
    challenge: DomString,
    origin: DomString,
    cross_origin: bool,
    token_binding: Option<TokenBinding>,
}

// https://www.w3.org/TR/webauthn/#client-data
#[derive(Drop, Clone)]
struct TokenBinding {
    status: DomString, // "present" | "supported" 
    id: Option<DomString>
}

// This is not strictly according to the specification
// TODO: Make it proper
#[derive(Drop, Clone, PartialEq)]
struct PublicKey {
    x: u256,
    y: u256
}

impl ImplPublicKeyTryIntoSecp256r1Point of TryInto<PublicKey, Secp256r1Point> {
    fn try_into(self: PublicKey) -> Option<Secp256r1Point> {
        match Secp256r1Impl::secp256_ec_new_syscall(self.x, self.y) {
            Result::Ok(op) => op,
            Result::Err => Option::None
        }
    }
}

// https://www.w3.org/TR/webauthn/#sctn-authenticator-data
#[derive(Drop, Clone)]
struct AuthenticatorData {
    rp_id_hash: Array<u8>,
    flags: u8,
    sign_count: u32
}

#[derive(Drop, Clone)]
struct AssertionOptions {
    // Byte encoded relying party id, eg. b"your-domain.com"
    expected_rp_id: Array<u8>,
    // See step 17 of https://www.w3.org/TR/webauthn/#sctn-verifying-assertion
    // and https://www.w3.org/TR/webauthn/#user-verification
    force_user_verified: bool
}

impl OptionTCloneImpl<T, impl TClone: Clone<T>> of Clone<Option<T>> {
    fn clone(self: @Option<T>) -> Option<T> {
        match self {
            Option::Some(s) => Option::Some(s.clone()),
            Option::None => Option::None,
        }
    }
}
