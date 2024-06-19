use account_sdk::webauthn_signer::signers::p256r1::P256VerifyingKeyConverter;
use p256::{
    ecdsa::{signature::Signer, Signature, SigningKey},
    elliptic_curve::rand_core::OsRng,
    SecretKey,
};
use proptest::collection;

use super::*;

const VERIFY_SIGNATURE: Function<SimpleVecParser, ConstLenExtractor<2>> = Function::new_webauthn(
    "verify_signature",
    SimpleVecParser::new(),
    ConstLenExtractor::new(),
);

fn verify_signature(
    hash: &[u8],
    auth_data: &[u8],
    signing_key: SigningKey,
    signature: Signature,
) -> bool {
    let (r, s) = (signature.r(), signature.s());
    let (r, s) = (r.to_bytes(), s.to_bytes());
    let (r, s) = (r.as_slice(), s.as_slice());
    let (x, y) = P256VerifyingKeyConverter::new(*signing_key.verifying_key()).to_bytes();
    let pub_key = P256r1PublicKey::from_bytes_be(&x, &y);
    let args = ArgsBuilder::new()
        .add_array(hash.iter().cloned())
        .add_array(auth_data.iter().cloned())
        .add_struct(pub_key.to_felts())
        .add_array(r.iter().copied().chain(s.iter().copied()));
    let result: [Felt252; 2] = VERIFY_SIGNATURE.run(args.build());
    result == [0.into(), 0.into()]
}

#[test]
fn test_verify_signature_1() {
    let hash: &[u8] = b"hello world";
    let auth_data = b"dummy auth data";
    let signing_key = SigningKey::random(&mut OsRng);
    let (signature, _) = signing_key.sign(&[auth_data, hash].concat());
    assert!(verify_signature(hash, auth_data, signing_key, signature))
}

#[test]
fn test_verify_signature_2() {
    let hash: &[u8] = b"1234567890987654321";
    let auth_data = b"auuuuuuuuuuth daaaaataaaaaaaaaa";
    let signing_key = SigningKey::random(&mut OsRng);
    let (signature, _) = signing_key.sign(&[auth_data, hash].concat());
    assert!(verify_signature(hash, auth_data, signing_key, signature))
}

#[test]
fn test_verify_signature_should_fail_1() {
    let hash = b"hello world";
    let auth_data = b"dummy auth data";
    let wrong_hash: &[u8] = b"definetly not hello world";
    let signing_key = SigningKey::random(&mut OsRng);
    let (signature, _) = signing_key.sign(&[auth_data, wrong_hash].concat());
    assert!(!verify_signature(hash, auth_data, signing_key, signature),)
}

#[test]
fn test_verify_signature_should_fail_2() {
    let hash: &[u8] = b"1234567890987654321";
    let auth_data = b"dummy auth data";
    let signing_key = SigningKey::random(&mut OsRng);
    let other_signing_key = SigningKey::random(&mut OsRng);
    let (signature, _) = signing_key.sign(&[auth_data, hash].concat());
    assert!(!verify_signature(
        hash,
        auth_data,
        other_signing_key,
        signature
    ))
}

proptest! {
    #[test]
    fn test_verify_signature_prop(
        (hash, auth_data, signing_key) in
            (
                collection::vec(any::<u8>(), 1..100),
                collection::vec(any::<u8>(), 1..100),
                collection::vec(any::<u8>(), 32)
                    .prop_map(|b| TryInto::<[u8; 32]>::try_into(b).unwrap())
                    .prop_map(|b| SigningKey::from(SecretKey::from_bytes(&b.into()).unwrap()))
            ),
    ) {
        let (signature, _) = signing_key.sign(&[auth_data.clone(), hash.clone()].concat());
        assert!(verify_signature(&hash, &auth_data, signing_key, signature))
    }
}
