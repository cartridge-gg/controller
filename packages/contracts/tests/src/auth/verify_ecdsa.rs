use account_sdk::webauthn_signer::signers::p256r1::P256VerifyingKeyConverter;
use p256::{
    ecdsa::{signature::Signer, Signature, SigningKey},
    elliptic_curve::{rand_core::OsRng, SecretKey},
};

use proptest::collection;
use sha2::{digest::Update, Digest, Sha256};

use super::*;

const VERIFY_HASHED_ECDSA: Function<SimpleVecParser, ConstLenExtractor<2>> = Function::new_webauthn(
    "verify_hashed_ecdsa_endpoint",
    SimpleVecParser::new(),
    ConstLenExtractor::new(),
);

fn verify_ecdsa(message: &[u8], signing_key: SigningKey, signature: Signature) -> bool {
    let (r, s) = (signature.r(), signature.s());
    let (r, s) = (r.to_bytes(), s.to_bytes());
    let (r, s) = (r.as_slice(), s.as_slice());
    let (r, s) = (
        CairoU256::from_byte_slice_be(r.try_into().unwrap()),
        CairoU256::from_byte_slice_be(s.try_into().unwrap()),
    );
    let (x, y) = P256VerifyingKeyConverter::new(*signing_key.verifying_key()).to_bytes();
    let pub_key = P256r1PublicKey::from_bytes_be(&x, &y);

    let hash = Sha256::new().chain(message).finalize();
    let hash: &[u8] = hash.as_slice();
    let hash = CairoU256::from_byte_slice_be(hash.try_into().unwrap());

    let args = ArgsBuilder::new()
        .add_struct(pub_key.to_felts())
        .add_struct(hash.to_felts())
        .add_struct(r.to_felts())
        .add_struct(s.to_felts());
    let result: [Felt252; 2] = VERIFY_HASHED_ECDSA.run(args.build());
    result == [0.into(), 0.into()]
}

#[test]
fn test_verify_ecdsa_1() {
    let message: &[u8] = b"hello world";
    let signing_key = SigningKey::random(&mut OsRng);
    let (signature, _) = signing_key.sign(message);
    assert!(verify_ecdsa(message, signing_key, signature));
}

proptest! {
    #[test]
    fn test_verify_ecdsa_prop(
        (message, signing_key) in
            (
                collection::vec(any::<u8>(), 1..100),
                collection::vec(any::<u8>(), 32)
                    .prop_map(|b| TryInto::<[u8; 32]>::try_into(b).unwrap())
                    .prop_map(|b| SigningKey::from(SecretKey::from_bytes(&b.into()).unwrap()))
            ),
    ) {
        let (signature, _) = signing_key.sign(&message);
        assert!(verify_ecdsa(&message, signing_key, signature));
    }
}
