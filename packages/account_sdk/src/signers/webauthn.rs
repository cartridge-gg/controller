use async_trait::async_trait;
use cainome::cairo_serde::{NonZero, U256};
use coset::{cbor::Value, iana, CoseKey, KeyType, Label};
use ecdsa::{RecoveryId, VerifyingKey};
use p256::NistP256;
use sha2::{digest::Update, Digest, Sha256};
use starknet::core::types::Felt;
use std::collections::BTreeMap;
use std::ops::Neg;
use std::result::Result;
use webauthn_rs_proto::{PublicKeyCredential, RegisterPublicKeyCredential};

use super::{DeviceError, HashSigner, SignError};
use crate::abigen::controller::Signature;
use crate::abigen::{
    self,
    controller::{Sha256Implementation, Signer, SignerSignature, WebauthnSignature},
};

use serde::{Deserialize, Serialize};

use base64urlsafedata::{Base64UrlSafeData, HumanBinaryData};
use coset::CborSerializable;
use nom::{
    bytes::complete::take,
    combinator::cond,
    error::ParseError,
    number::complete::{be_u16, be_u32},
};
use serde::de::DeserializeOwned;
use serde_cbor_2::error::Error as CBORError;
use webauthn_rs_proto::*;

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
    /// auth_data.
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
    #[serde(default)]
    pub(super) cross_origin: bool,
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait WebauthnOperations {
    async fn get_assertion(
        &self,
        options: PublicKeyCredentialRequestOptions,
    ) -> Result<PublicKeyCredential, DeviceError>;

    async fn create_credential(
        options: PublicKeyCredentialCreationOptions,
    ) -> Result<RegisterPublicKeyCredential, DeviceError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> HashSigner for WebauthnSigner<T>
where
    T: WebauthnOperations + Sync,
{
    // According to https://www.w3.org/TR/webauthn/#clientdatajson-verification
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        let mut challenge = tx_hash.to_bytes_be().to_vec();
        challenge.push(Sha256Implementation::Cairo1.encode());

        let options = PublicKeyCredentialRequestOptions {
            challenge: Base64UrlSafeData::from(challenge),
            timeout: Some(500),
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

        let cred = self
            .operations
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

        let ecdsa_sig =
            ecdsa::Signature::<NistP256>::from_der(cred.response.signature.as_slice()).unwrap();
        let (r, mut s) = ecdsa_sig.split_scalars();
        let pub_key = self.pub_key_bytes().map_err(SignError::Device)?;
        let sec1_key = [&[0x4], pub_key.as_slice()].concat();

        let verifying_key = VerifyingKey::from_sec1_bytes(&sec1_key).unwrap();
        let mut y_parity =
            RecoveryId::trial_recovery_from_msg(&verifying_key, &message, &ecdsa_sig)
                .unwrap()
                .is_y_odd();

        let s_neg = s.neg();
        if s.as_ref() > s_neg.as_ref() {
            s = s_neg;
            y_parity = !y_parity;
        }

        let signature = Signature {
            r: U256::from_bytes_be(r.to_bytes().as_slice().try_into().unwrap()),
            s: U256::from_bytes_be(s.to_bytes().as_slice().try_into().unwrap()),
            y_parity,
        };

        let client_data: ClientData = serde_json::from_str(&client_data_json).unwrap();
        let client_data_json_outro = extract_client_data_json_outro(&client_data_json);
        let webauthn_signature = WebauthnSignature {
            flags,
            cross_origin: client_data.cross_origin,
            sign_count: counter,
            ec_signature: signature,
            sha256_implementation: Sha256Implementation::Cairo1,
            client_data_json_outro,
        };

        Ok(SignerSignature::Webauthn((
            abigen::controller::WebauthnSigner::from(self),
            webauthn_signature,
        )))
    }

    fn signer(&self) -> Signer {
        Signer::Webauthn(abigen::controller::WebauthnSigner::from(self))
    }
}

trait Sha256ImplementationEncoder {
    fn encode(&self) -> u8;
}

impl Sha256ImplementationEncoder for Sha256Implementation {
    fn encode(&self) -> u8 {
        match self {
            Sha256Implementation::Cairo0 => 0,
            Sha256Implementation::Cairo1 => 1,
        }
    }
}

#[derive(Debug, Clone)]
pub struct WebauthnSigner<T: WebauthnOperations> {
    pub rp_id: String,
    pub origin: String,
    pub credential_id: CredentialID,
    pub pub_key: CoseKey,
    pub operations: T,
}

impl<T: WebauthnOperations> From<&WebauthnSigner<T>> for abigen::controller::WebauthnSigner {
    fn from(signer: &WebauthnSigner<T>) -> Self {
        Self {
            rp_id_hash: NonZero::new(U256::from_bytes_be(&signer.rp_id_hash())).unwrap(),
            origin: signer.origin.clone().into_bytes(),
            pubkey: NonZero::new(U256::from_bytes_be(
                &signer.pub_key_bytes().unwrap()[0..32].try_into().unwrap(),
            ))
            .unwrap(),
        }
    }
}

impl<T: WebauthnOperations> WebauthnSigner<T> {
    pub fn new(
        rp_id: String,
        origin: String,
        credential_id: CredentialID,
        pub_key: CoseKey,
        operations: T,
    ) -> Self {
        Self {
            rp_id,
            origin,
            credential_id,
            pub_key,
            operations,
        }
    }

    pub async fn register(
        rp_id: String,
        origin: String,
        user_name: String,
        challenge: &[u8],
        operations: T,
    ) -> Result<Self, DeviceError> {
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
        let res = T::create_credential(options).await?;
        let ao =
            AttestationObject::<Registration>::try_from(res.response.attestation_object.as_ref())
                .map_err(|e| DeviceError::CreateCredential(format!("CoseError: {:?}", e)))
                .unwrap();

        let cred = ao.auth_data.acd.unwrap();

        let pub_key =
            CoseKey::from_slice(&serde_cbor_2::to_vec(&cred.credential_pk).unwrap()).unwrap();

        Ok(Self {
            rp_id,
            credential_id: cred.credential_id,
            pub_key,
            origin,
            operations,
        })
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
    let cross_origin_index = client_data_json.rfind("\"crossOrigin\"");
    match cross_origin_index {
        Some(index) => {
            let outro_sub = client_data_json[index..].to_string();
            let outro_start = outro_sub.rfind(',').unwrap_or(outro_sub.len());
            let outro_str = &outro_sub[outro_start..];
            outro_str.as_bytes().to_vec()
        }
        None => vec![],
    }
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

#[cfg(test)]
mod tests {
    use super::extract_client_data_json_outro;

    #[test]
    fn test_extract_client_data_json_outro() {
        let json_with_cross_origin = "{\"type\":\"webauthn.get\",\"challenge\":\"BGJcocCMZ8w1AoRN0wAHFsNtNAVJ3fi83s65MW8jUfIB\",\"origin\":\"http://localhost:3001\",\"crossOrigin\":true,\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://goo.gl/yabPex\"}";
        let expected_outro = ",\"other_keys_can_be_added_here\":\"do not compare clientDataJSON against a template. See https://goo.gl/yabPex\"}";
        let outro = extract_client_data_json_outro(json_with_cross_origin);
        let outro_string = String::from_utf8(outro).expect("Invalid UTF-8");
        assert_eq!(outro_string, expected_outro);

        let json_without_outro =
        "{\"type\":\"webauthn.get\",\"challenge\":\"BD7mj5jZ_ySvAv7kgFJ1HKRknsHwYuwtWbkjJPqQKi4B\",\"origin\":\"http://localhost:3001\",\"crossOrigin\":true}";
        let outro = extract_client_data_json_outro(json_without_outro);
        let outro_string = String::from_utf8(outro).expect("Invalid UTF-8");
        assert_eq!(outro_string, "");
    }
}
