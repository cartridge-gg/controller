use p256::{
    ecdsa::{signature::Signer, Signature, SigningKey},
    elliptic_curve::sec1::Coordinates,
};
use rand_core::OsRng;

#[tokio::test]
async fn test_ecdsa() {
    // Signing
    let signing_key = SigningKey::random(&mut OsRng); // Serialize with `::to_bytes()`
    let message = b"ECDSA proves knowledge of a secret number in the context of a single message";
    let signature: Signature = signing_key.sign(message);

    // Verification
    use p256::ecdsa::{signature::Verifier, VerifyingKey};

    let verifying_key: VerifyingKey = VerifyingKey::from(&signing_key); // Serialize with `::to_encoded_point()`
    let encoded = &verifying_key.to_encoded_point(false);
    let (x, y) = match encoded.coordinates() {
        Coordinates::Uncompressed { x, y } => (x, y),
        _ => panic!("unexpected compression"),
    };
    dbg!(x.len(), y.len());
    assert!(verifying_key.verify(message, &signature).is_ok());
}
