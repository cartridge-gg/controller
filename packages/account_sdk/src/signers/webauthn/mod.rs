use async_trait::async_trait;
use base64urlsafedata::{Base64UrlSafeData, HumanBinaryData};
use cainome::cairo_serde::{NonZero, U256};
use coset::CborSerializable;
use coset::{cbor::Value, iana, CoseKey, KeyType, Label};
use nom::{
    bytes::complete::take,
    combinator::cond,
    error::ParseError,
    number::complete::{be_u16, be_u32},
};
use once_cell::sync::Lazy;
use p256::NistP256;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_cbor_2::error::Error as CBORError;
use sha2::{digest::Update, Digest, Sha256};
use starknet::core::types::Felt;
use starknet::macros::short_string;
use starknet_crypto::PoseidonHasher;
use std::collections::BTreeMap;
use std::ops::Neg;
use std::result::Result;
use webauthn_rs_proto::{
    AllowCredentials, AttestationConveyancePreference, AuthenticatorSelectionCriteria,
    CredentialProtectionPolicy, PubKeyCredParams, PublicKeyCredential,
    PublicKeyCredentialCreationOptions, PublicKeyCredentialRequestOptions,
    RegisterPublicKeyCredential, RelyingParty, User, UserVerificationPolicy,
};

use super::{DeviceError, HashSigner, SignError};
use crate::abigen::controller::Signature;
use crate::abigen::{
    self,
    controller::{SignerSignature, WebauthnSignature},
};

#[cfg(target_arch = "wasm32")]
pub mod browser;
#[cfg(not(target_arch = "wasm32"))]
pub mod softpasskey;

#[cfg(not(target_arch = "wasm32"))]
pub type Operations = softpasskey::SoftPasskeyOperations;

#[cfg(target_arch = "wasm32")]
pub type Operations = browser::BrowserOperations;

#[cfg(not(target_arch = "wasm32"))]
pub static OPERATIONS: Lazy<Operations> = Lazy::new(|| {
    softpasskey::SoftPasskeyOperations::new("https://cartridge.gg".try_into().unwrap())
});

#[cfg(target_arch = "wasm32")]
pub static OPERATIONS: Lazy<Operations> = Lazy::new(|| browser::BrowserOperations {});

/// Marker type parameter for data related to registration ceremony
#[derive(Debug)]
pub struct Registration;

/// Marker type parameter for data related to authentication ceremony
#[derive(Debug)]
pub struct Authentication;

/// Trait for ceremony marker structs
pub trait Ceremony {
    /// The type of the extension outputs of the ceremony
    type SignedExtensions: DeserializeOwned + std::fmt::Debug + std::default::Default;
}

impl Ceremony for Registration {
    type SignedExtensions = RegistrationSignedExtensions;
}

impl Ceremony for Authentication {
    type SignedExtensions = AuthenticationSignedExtensions;
}

/// The client's response to the request that it use the `credProtect` extension
///
/// Implemented as wrapper struct to (de)serialize
/// [CredentialProtectionPolicy] as a number
#[derive(Debug, Serialize, Clone, Deserialize)]
#[serde(try_from = "u8", into = "u8")]
pub struct CredProtectResponse(pub CredentialProtectionPolicy);

impl TryFrom<u8> for CredProtectResponse {
    type Error = <CredentialProtectionPolicy as TryFrom<u8>>::Error;

    fn try_from(v: u8) -> Result<Self, Self::Error> {
        CredentialProtectionPolicy::try_from(v).map(CredProtectResponse)
    }
}

impl From<CredProtectResponse> for u8 {
    fn from(policy: CredProtectResponse) -> Self {
        policy.0 as u8
    }
}

/// The output for registration ceremony extensions.
///
/// Implements the registration bits of \[AuthenticatorExtensionsClientOutputs\]
/// from the spec
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RegistrationSignedExtensions {
    /// The `credProtect` extension
    #[serde(rename = "credProtect")]
    pub cred_protect: Option<CredProtectResponse>,
    /// The `hmac-secret` extension response to a create request
    #[serde(rename = "hmac-secret")]
    pub hmac_secret: Option<bool>,
    /// Extension key-values that we have parsed, but don't strictly recognise.
    #[serde(flatten)]
    pub unknown_keys: BTreeMap<String, serde_cbor_2::Value>,
}

/// The output for authentication cermeony extensions.
///
/// Implements the authentication bits of
/// \[AuthenticationExtensionsClientOutputs] from the spec
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AuthenticationSignedExtensions {
    /// Extension key-values that we have parsed, but don't strictly recognise.
    #[serde(flatten)]
    pub unknown_keys: BTreeMap<String, serde_cbor_2::Value>,
}

/// Representation of an AAGUID
/// <https://www.w3.org/TR/webauthn/#aaguid>
pub type Aaguid = [u8; 16];

pub type CredentialID = HumanBinaryData;

/// Attested Credential Data
#[derive(Debug, Clone)]
pub struct AttestedCredentialData {
    /// The guid of the authenticator. May indicate manufacturer.
    pub aaguid: Aaguid,
    /// The credential ID.
    pub credential_id: CredentialID,
    /// The credentials public Key.
    pub credential_pk: serde_cbor_2::Value,
}

/// Data returned by this authenticator during registration.
#[derive(Debug, Clone)]
pub struct AuthenticatorData<T: Ceremony> {
    pub rp_id_hash: Vec<u8>,
    /// The counter of this credentials activations.
    pub counter: u32,
    /// Flag if the user was present.
    pub user_present: bool,
    /// Flag is the user verified to the device. Implies presence.
    pub user_verified: bool,
    /// Flag defining if the authenticator *could* be backed up OR transferred
    /// between multiple devices.
    pub backup_eligible: bool,
    /// Flag defining if the authenticator *knows* it is currently backed up or
    /// present on multiple devices.
    pub backup_state: bool,
    /// The optional attestation.
    pub acd: Option<AttestedCredentialData>,
    /// Extensions supplied by the device.
    pub extensions: T::SignedExtensions,
}

/// Possible errors that may occur during Webauthn Operation processing.
#[derive(Debug, thiserror::Error)]
pub enum WebauthnError {
    #[error("A NOM parser failure has occurred")]
    ParseNOMFailure,

    #[error("A CBOR parser failure has occurred")]
    ParseCBORFailure(#[from] CBORError),
}

impl PartialEq for WebauthnError {
    fn eq(&self, other: &Self) -> bool {
        std::mem::discriminant(self) == std::mem::discriminant(other)
    }
}

fn aaguid_parser(i: &[u8]) -> nom::IResult<&[u8], Aaguid> {
    let (i, aaguid) = take(16usize)(i)?;
    Ok((i, aaguid.try_into().expect("took 16 bytes exactly")))
}

fn cbor_parser(i: &[u8]) -> nom::IResult<&[u8], serde_cbor_2::Value> {
    let mut deserializer = serde_cbor_2::Deserializer::from_slice(i);
    let v = serde::de::Deserialize::deserialize(&mut deserializer).map_err(|_| {
        nom::Err::Failure(nom::error::Error::from_error_kind(
            i,
            nom::error::ErrorKind::Fail,
        ))
    })?;

    let len = deserializer.byte_offset();

    Ok((&i[len..], v))
}

fn acd_parser(i: &[u8]) -> nom::IResult<&[u8], AttestedCredentialData> {
    let (i, aaguid) = aaguid_parser(i)?;
    let (i, cred_id_len) = be_u16(i)?;

    let (i, cred_id) = take(cred_id_len as usize)(i)?;
    let (i, cred_pk) = cbor_parser(i)?;

    Ok((
        i,
        AttestedCredentialData {
            aaguid,
            credential_id: HumanBinaryData::from(cred_id.to_vec()),
            credential_pk: cred_pk,
        },
    ))
}

#[allow(clippy::type_complexity)]
fn authenticator_data_flags(i: &[u8]) -> nom::IResult<&[u8], (bool, bool, bool, bool, bool, bool)> {
    // Using nom for bit fields is shit, do it by hand.
    let (i, ctrl) = nom::number::complete::u8(i)?;
    let exten_pres = (ctrl & 0b1000_0000) != 0;
    let acd_pres = (ctrl & 0b0100_0000) != 0;
    let bak_st = (ctrl & 0b0001_0000) != 0;
    let bak_el = (ctrl & 0b0000_1000) != 0;
    let u_ver = (ctrl & 0b0000_0100) != 0;
    let u_pres = (ctrl & 0b0000_0001) != 0;
    Ok((i, (exten_pres, acd_pres, u_ver, u_pres, bak_el, bak_st)))
}

fn authenticator_data_parser<T: Ceremony>(i: &[u8]) -> nom::IResult<&[u8], AuthenticatorData<T>> {
    let (i, rp_id_hash) = take(32usize)(i)?;
    let (i, data_flags) = authenticator_data_flags(i)?;
    let (i, counter) = be_u32(i)?;
    let (i, acd) = cond(data_flags.1, acd_parser)(i)?;

    let extensions = Default::default();

    Ok((
        i,
        AuthenticatorData {
            rp_id_hash: rp_id_hash.to_vec(),
            counter,
            user_verified: data_flags.2,
            user_present: data_flags.3,
            backup_eligible: data_flags.4,
            backup_state: data_flags.5,
            acd,
            extensions,
        },
    ))
}

impl<T: Ceremony> TryFrom<&[u8]> for AuthenticatorData<T> {
    type Error = WebauthnError;
    fn try_from(auth_data_bytes: &[u8]) -> Result<Self, Self::Error> {
        authenticator_data_parser(auth_data_bytes)
            .map_err(|_| WebauthnError::ParseNOMFailure)
            .map(|(_, ad)| ad)
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AttestationObjectInner<'a> {
    pub(crate) auth_data: &'a [u8],
}

/// Attestation Object
#[derive(Debug)]
pub struct AttestationObject<T: Ceremony> {
    pub auth_data: AuthenticatorData<T>,
}

impl<T: Ceremony> TryFrom<&[u8]> for AttestationObject<T> {
    type Error = WebauthnError;

    fn try_from(data: &[u8]) -> Result<AttestationObject<T>, WebauthnError> {
        let aoi: AttestationObjectInner =
            serde_cbor_2::from_slice(data).map_err(WebauthnError::ParseCBORFailure)?;
        let auth_data_bytes: &[u8] = aoi.auth_data;
        let auth_data = AuthenticatorData::try_from(auth_data_bytes)?;

        // Yay! Now we can assemble a reasonably sane structure.
        Ok(AttestationObject { auth_data })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientData {
    #[serde(rename = "type")]
    pub(super) type_: String,
    pub(super) challenge: String,
    pub(super) origin: String,
    #[serde(rename = "crossOrigin")]
    pub(super) cross_origin: Option<bool>,
    #[serde(rename = "topOrigin")]
    pub(super) top_origin: Option<String>,
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait WebauthnOperations: std::fmt::Debug {
    async fn get_assertion(
        &self,
        options: PublicKeyCredentialRequestOptions,
    ) -> Result<PublicKeyCredential, DeviceError>;

    async fn create_credential(
        &self,
        options: PublicKeyCredentialCreationOptions,
    ) -> Result<RegisterPublicKeyCredential, DeviceError>;

    fn origin(&self) -> Result<String, DeviceError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl HashSigner for WebauthnSigner {
    // According to https://www.w3.org/TR/webauthn/#clientdatajson-verification
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        let challenge = tx_hash.to_bytes_be().to_vec();

        let options = PublicKeyCredentialRequestOptions {
            challenge: Base64UrlSafeData::from(challenge),
            timeout: None,
            rp_id: self.rp_id.clone(),
            allow_credentials: vec![AllowCredentials {
                type_: "public-key".to_string(),
                id: Base64UrlSafeData::from(self.credential_id.clone()),
                transports: None,
            }],
            user_verification: UserVerificationPolicy::Required,
            hints: None,
            extensions: None,
        };

        let cred = OPERATIONS
            .get_assertion(options)
            .await
            .map_err(SignError::Device)?;

        let flags = cred.response.authenticator_data.as_slice()[32];
        let counter = u32::from_be_bytes(
            cred.response.authenticator_data.as_slice()[33..37]
                .try_into()
                .unwrap(),
        );

        let client_data_json = String::from_utf8(cred.response.client_data_json.to_vec()).unwrap();
        let client_data_hash = Sha256::new().chain(client_data_json.clone()).finalize();
        let mut message: Vec<u8> = cred.response.authenticator_data.as_slice().into();
        message.append(&mut client_data_hash.to_vec());

        let (r, s, y_parity) =
            extract_ecdsa_signature_components(cred.response.signature.as_slice())
                .map_err(SignError::Device)?;
        let signature = Signature { r, s, y_parity };

        let client_data_json_outro = extract_client_data_json_outro(&client_data_json);
        let webauthn_signature = WebauthnSignature {
            flags,
            sign_count: counter,
            ec_signature: signature,
            client_data_json_outro,
        };

        Ok(SignerSignature::Webauthn((
            abigen::controller::WebauthnSigner::from(self.clone()),
            webauthn_signature,
        )))
    }
}

#[derive(Debug, Clone)]
pub struct WebauthnSigner {
    pub rp_id: String,
    pub credential_id: CredentialID,
    pub pub_key: CoseKey,
}

impl From<WebauthnSigner> for abigen::controller::WebauthnSigner {
    fn from(signer: WebauthnSigner) -> Self {
        Self {
            rp_id_hash: NonZero::new(U256::from_bytes_be(&signer.rp_id_hash())).unwrap(),
            origin: OPERATIONS.origin().unwrap().into_bytes(),
            pubkey: NonZero::new(U256::from_bytes_be(
                &signer.pub_key_bytes().unwrap()[0..32].try_into().unwrap(),
            ))
            .unwrap(),
        }
    }
}

impl From<abigen::controller::WebauthnSigner> for Felt {
    fn from(signer: abigen::controller::WebauthnSigner) -> Self {
        let mut state = PoseidonHasher::new();
        state.update(short_string!("Webauthn Signer"));
        state.update(signer.origin.len().into());
        for b in &signer.origin {
            state.update((*b).into())
        }
        let rp_id_hash = signer.rp_id_hash.inner();
        state.update(rp_id_hash.low.into());
        state.update(rp_id_hash.high.into());
        let pub_key = signer.pubkey.inner();
        state.update(pub_key.low.into());
        state.update(pub_key.high.into());
        state.finalize()
    }
}

impl WebauthnSigner {
    pub fn new(rp_id: String, credential_id: CredentialID, pub_key: CoseKey) -> Self {
        Self {
            rp_id,
            credential_id,
            pub_key,
        }
    }

    pub async fn register(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<(WebauthnSigner, WebauthnSignature), DeviceError> {
        let options = PublicKeyCredentialCreationOptions {
            rp: RelyingParty {
                name: "Cartridge".to_string(),
                id: rp_id.clone(),
            },
            user: User {
                id: Base64UrlSafeData::from(vec![0]),
                name: user_name.clone(),
                display_name: "".to_string(),
            },
            challenge: Base64UrlSafeData::from(challenge),
            pub_key_cred_params: vec![PubKeyCredParams {
                type_: "public-key".to_string(),
                alg: -7,
            }],
            timeout: Some(500),
            attestation: Some(AttestationConveyancePreference::Direct),
            exclude_credentials: None,
            authenticator_selection: Some(AuthenticatorSelectionCriteria {
                user_verification: UserVerificationPolicy::Required,
                ..AuthenticatorSelectionCriteria::default()
            }),
            extensions: None,
            hints: None,
            attestation_formats: None,
        };
        let res = OPERATIONS.create_credential(options).await?;

        // Use the new attestation object parser that returns the DER signature if present.
        let (ao, der_sig_opt) =
            AttestationObject::<Registration>::from_full(res.response.attestation_object.as_ref())
                .map_err(|e| DeviceError::CreateCredential(format!("CoseError: {:?}", e)))?;

        // Return error if no DER signature is present
        let der_sig = der_sig_opt.ok_or_else(|| {
            DeviceError::CreateCredential(
                "No DER signature found in attestation object".to_string(),
            )
        })?;

        let (r, s, y_parity) = extract_ecdsa_signature_components(&der_sig)
            .map_err(|e| DeviceError::CreateCredential(format!("{:?}", e)))?;

        let cred = ao.auth_data.acd.unwrap();
        let pub_key =
            CoseKey::from_slice(&serde_cbor_2::to_vec(&cred.credential_pk).unwrap()).unwrap();
        let signer = Self {
            rp_id,
            credential_id: cred.credential_id,
            pub_key,
        };

        let flags = ((ao.auth_data.user_verified as u8) << 2) | (ao.auth_data.user_present as u8);
        let counter = ao.auth_data.counter;
        let client_data_json = String::from_utf8(res.response.client_data_json.to_vec()).unwrap();
        let client_data_json_outro = extract_client_data_json_outro(&client_data_json);
        let signature = WebauthnSignature {
            flags,
            sign_count: counter,
            ec_signature: Signature { r, s, y_parity },
            client_data_json_outro,
        };

        Ok((signer, signature))
    }

    pub fn rp_id_hash(&self) -> [u8; 32] {
        use sha2::{digest::Update, Digest, Sha256};
        Sha256::new().chain(self.rp_id.clone()).finalize().into()
    }

    pub fn pub_key_bytes(&self) -> Result<[u8; 64], DeviceError> {
        extract_pub_key(&self.pub_key)
    }
}

fn extract_client_data_json_outro(client_data_json: &str) -> Vec<u8> {
    client_data_json
        .split_once(",\"origin\":")
        .map_or("", |(_, rest)| rest)
        .split_once("\",")
        .map(|(_, rest)| format!(",{rest}"))
        .unwrap_or("".to_string())
        .into_bytes()
}

fn extract_pub_key(cose_key: &CoseKey) -> Result<[u8; 64], DeviceError> {
    if cose_key.kty != KeyType::Assigned(iana::KeyType::EC2) {
        return Err(DeviceError::CreateCredential(
            "Invalid key type".to_string(),
        ));
    }

    let mut x_coord: Option<Vec<u8>> = None;
    let mut y_coord: Option<Vec<u8>> = None;

    for (label, value) in &cose_key.params {
        match label {
            Label::Int(-2) => {
                if let Value::Bytes(vec) = value {
                    x_coord = Some(vec.clone());
                }
            }
            Label::Int(-3) => {
                if let Value::Bytes(vec) = value {
                    y_coord = Some(vec.clone());
                }
            }
            _ => {}
        }
    }

    let x = x_coord.ok_or(DeviceError::CreateCredential("No x coord".to_string()))?;
    let y = y_coord.ok_or(DeviceError::CreateCredential("No y coord".to_string()))?;

    if x.len() != 32 || y.len() != 32 {
        return Err(DeviceError::CreateCredential(
            "Invalid key length".to_string(),
        ));
    }

    let mut pub_key = [0u8; 64];
    pub_key[..32].copy_from_slice(&x);
    pub_key[32..].copy_from_slice(&y);

    Ok(pub_key)
}

fn extract_ecdsa_signature_components(sig_der: &[u8]) -> Result<(U256, U256, bool), DeviceError> {
    // Parse the DER-encoded signature for NistP256.
    let ecdsa_sig = ecdsa::Signature::<NistP256>::from_der(sig_der).map_err(|e| {
        DeviceError::CreateCredential(format!("Failed to parse DER signature: {:?}", e))
    })?;

    // Split the signature into its two scalar components.
    let (r, mut s) = ecdsa_sig.split_scalars();

    // In many protocols (including some ECDSA verification flows) you normalize s to be in "low-S" form.
    // To do so, compute the negation of s and compare: if s > (-s), then use -s and adjust y_parity.
    let s_neg = s.neg();
    let mut y_parity = false; // This is a placeholder; computing the correct recovery id may require additional context.
    if s.as_ref() > s_neg.as_ref() {
        s = s_neg;
        y_parity = true;
    }

    // Convert the scalar values to U256 (from their big-endian bytes).
    let r_u256 = U256::from_bytes_be(r.to_bytes().as_slice().try_into().unwrap());
    let s_u256 = U256::from_bytes_be(s.to_bytes().as_slice().try_into().unwrap());
    Ok((r_u256, s_u256, y_parity))
}

#[derive(Debug, Deserialize)]
struct FullAttestationObject<'a> {
    #[serde(rename = "authData")]
    auth_data: &'a [u8],
    fmt: String,
    #[serde(rename = "attStmt")]
    att_stmt: serde_cbor_2::Value,
}

impl<T: Ceremony> AttestationObject<T> {
    /// Creates an attestation object and attempts to extract a DER-encoded signature from the attestation statement.
    pub fn from_full(data: &[u8]) -> Result<(Self, Option<Vec<u8>>), WebauthnError> {
        // Parse the full attestation object containing authData, fmt, and attStmt.
        let full: FullAttestationObject =
            serde_cbor_2::from_slice(data).map_err(WebauthnError::ParseCBORFailure)?;
        let auth_data_bytes = full.auth_data;
        let auth_data = AuthenticatorData::try_from(auth_data_bytes)?;

        // Attempt to extract DER signature from attStmt (this assumes the field "sig" exists).
        let der_sig = if let serde_cbor_2::Value::Map(map) = full.att_stmt {
            map.into_iter().find_map(|(k, v)| {
                if let serde_cbor_2::Value::Text(ref key) = k {
                    if key == "sig" {
                        if let serde_cbor_2::Value::Bytes(bytes) = v {
                            return Some(bytes);
                        }
                    }
                }
                None
            })
        } else {
            None
        };

        Ok((AttestationObject { auth_data }, der_sig))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use p256::ecdsa::{signature::Signer, SigningKey};
    use p256::elliptic_curve::generic_array::GenericArray;
    use std::collections::BTreeMap;

    /// Test that when the attestation object contains a DER‑encoded signature (e.g. in "packed" format),
    /// it is correctly extracted.
    #[test]
    fn test_attestation_object_from_full_with_sig() {
        // Generate a valid DER signature using a fixed signing key.
        let key_bytes = GenericArray::clone_from_slice(&[1u8; 32]);
        let signing_key = SigningKey::from_bytes(&key_bytes).expect("Valid key");
        let message = b"test message";
        let signature: p256::ecdsa::Signature = signing_key.sign(message);
        let der_sig = signature.to_der().as_bytes().to_vec();

        // Create minimal valid authenticator data (37 bytes: 32 bytes rp_id_hash, 1 byte flags, 4 bytes counter)
        let mut auth_data = vec![0u8; 37];
        // Set the flags byte (at offset 32) to 0 so that attested credential data is not expected.
        auth_data[32] = 0;

        // Construct a CBOR map for the attestation statement that contains the DER signature.
        let mut att_stmt_map = BTreeMap::new();
        att_stmt_map.insert(
            serde_cbor_2::Value::Text("sig".to_string()),
            serde_cbor_2::Value::Bytes(der_sig.clone()),
        );

        // Build a fake attestation object with "authData", "fmt" and "attStmt"
        let mut att_obj_map = BTreeMap::new();
        att_obj_map.insert(
            serde_cbor_2::Value::Text("authData".to_string()),
            serde_cbor_2::Value::Bytes(auth_data.clone()),
        );
        att_obj_map.insert(
            serde_cbor_2::Value::Text("fmt".to_string()),
            serde_cbor_2::Value::Text("packed".to_string()),
        );
        att_obj_map.insert(
            serde_cbor_2::Value::Text("attStmt".to_string()),
            serde_cbor_2::Value::Map(att_stmt_map),
        );
        let attestation_object =
            serde_cbor_2::to_vec(&serde_cbor_2::Value::Map(att_obj_map)).unwrap();

        let (att_obj, sig_opt) = AttestationObject::<Registration>::from_full(&attestation_object)
            .expect("Attestation object parsing should succeed");
        // Verify that the authenticator data is parsed (counter should be zero).
        assert_eq!(att_obj.auth_data.counter, 0);
        // And the DER‑encoded signature is correctly extracted.
        assert!(sig_opt.is_some());
        assert_eq!(sig_opt.unwrap(), der_sig);
    }

    /// Test that when no DER‑encoded signature is present (passkey implementations often use attestation "none"),
    /// the extraction correctly returns None.
    #[test]
    fn test_attestation_object_from_full_without_sig() {
        // Create minimal valid authenticator data (37 bytes: 32 bytes rp_id_hash, 1 byte flags, 4 bytes counter)
        let mut auth_data = vec![0u8; 37];
        auth_data[32] = 0;

        // Construct an empty attStmt map (i.e. no "sig" field)
        let att_stmt_map = BTreeMap::new();

        // Build a fake attestation object with "attStmt" as an empty map.
        let mut att_obj_map = BTreeMap::new();
        att_obj_map.insert(
            serde_cbor_2::Value::Text("authData".to_string()),
            serde_cbor_2::Value::Bytes(auth_data.clone()),
        );
        // Even though we request a format like "none" in passkey scenarios, it still must be valid CBOR.
        att_obj_map.insert(
            serde_cbor_2::Value::Text("fmt".to_string()),
            serde_cbor_2::Value::Text("none".to_string()),
        );
        att_obj_map.insert(
            serde_cbor_2::Value::Text("attStmt".to_string()),
            serde_cbor_2::Value::Map(att_stmt_map),
        );
        let attestation_object =
            serde_cbor_2::to_vec(&serde_cbor_2::Value::Map(att_obj_map)).unwrap();

        let (att_obj, sig_opt) = AttestationObject::<Registration>::from_full(&attestation_object)
            .expect("Attestation object parsing should succeed");
        // Verify that basic authenticator data is parsed.
        assert_eq!(att_obj.auth_data.counter, 0);
        // No signature field is present so extraction should return None.
        assert!(sig_opt.is_none());
    }

    /// Test that passing invalid (non-CBOR) data fails to parse.
    #[test]
    fn test_attestation_object_from_full_invalid_data() {
        let invalid_data = b"invalid data";
        let result = AttestationObject::<Registration>::from_full(invalid_data);
        assert!(result.is_err());
    }

    /// Test the DER‑encoded signature extraction function using a valid signature.
    #[test]
    fn test_extract_ecdsa_signature_components_valid() {
        let key_bytes = GenericArray::clone_from_slice(&[1u8; 32]);
        let signing_key = SigningKey::from_bytes(&key_bytes).expect("Valid key");
        let message = b"dummy message";
        let signature: p256::ecdsa::Signature = signing_key.sign(message);
        let der_sig = signature.to_der().as_bytes().to_vec();

        let (r, s, y_parity) = extract_ecdsa_signature_components(&der_sig)
            .expect("Should extract ECDSA signature components");
        // Basic sanity checks: ensure r and s are nonzero.
        assert_ne!(r, U256::from_bytes_be(&[0; 32]));
        assert_ne!(s, U256::from_bytes_be(&[0; 32]));
        // y_parity is a boolean flag; we simply check that it's a valid bool value.
        let _ = y_parity;
    }

    /// Test that extracting components from an invalid signature returns an error.
    #[test]
    fn test_extract_ecdsa_signature_components_invalid() {
        let invalid_sig = b"not a valid der signature";
        let result = extract_ecdsa_signature_components(invalid_sig);
        assert!(result.is_err());
    }

    fn validate_extraction(input: &str, expected: &str) {
        let outro = extract_client_data_json_outro(input);
        let outro_string = String::from_utf8(outro).expect("Invalid UTF-8");
        assert_eq!(outro_string, expected);
    }

    #[test]
    fn test_extract_client_data_json_outro_1() {
        validate_extraction(
            "{\"type\":\"webauthn.get\",\"challenge\":\"BGJcocCMZ8w1AoRN0wAHFsNtNAVJ3fi83s65MW8jUfIB\",\"origin\":\"http://localhost:3001\",\"crossOrigin\":true,\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://goo.gl/yabPex\"}", 
            ",\"crossOrigin\":true,\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://goo.gl/yabPex\"}"
       );
    }

    #[test]
    fn test_extract_client_data_json_outro_2() {
        validate_extraction(
            "{\"type\":\"webauthn.get\",\"challenge\":\"BD7mj5jZ_ySvAv7kgFJ1HKRknsHwYuwtWbkjJPqQKi4B\",\"origin\":\"http://localhost:3001\",\"crossOrigin\":true}",
            ",\"crossOrigin\":true}"
        );
    }

    #[test]
    fn test_extract_client_data_json_outro_3() {
        validate_extraction(
            "{\"type\":\"webauthn.get\",\"challenge\":\"BGJcocCMZ8w1AoRN0wAHFsNtNAVJ3fi83s65MW8jUfIB\",\"origin\":\"http://localhost:3001\",\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://goo.gl/yabPex\"}",
            ",\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://goo.gl/yabPex\"}"
        );
    }

    #[test]
    fn test_extract_client_data_json_outro_4() {
        validate_extraction(
            "{\"type\":\"webauthn.get\",\"challenge\":\"BGJcocCMZ8w1AoRN0wAHFsNtNAVJ3fi83s65MW8jUfIB\",\"origin\":\"http://localhost:3001\"}",
            ""
        );
    }
}
