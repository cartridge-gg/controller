use crate::signers::webauthn::{CredentialID, WebauthnOperations};
use crate::signers::DeviceError;
use crate::{
    abigen::erc_20::Erc20,
    signers::HashSigner,
    tests::{account::FEE_TOKEN_ADDRESS, runners::katana::KatanaRunner},
};
use async_trait::async_trait;
use base64urlsafedata::Base64UrlSafeData;
use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
    signers::SigningKey as StarkSigningKey,
};
use webauthn_authenticator_rs::authenticator_hashed::AuthenticatorBackendHashedClientData;
use webauthn_authenticator_rs::softpasskey::SoftPasskey;
use webauthn_authenticator_rs::AuthenticatorBackend;
use webauthn_rs_core::crypto::compute_sha256;
use webauthn_rs_core::proto::{AttestationObject, Registration};
use webauthn_rs_proto::{
    AllowCredentials, AttestationConveyancePreference, AuthenticatorSelectionCriteria,
    CollectedClientData, PubKeyCredParams, PublicKeyCredential, PublicKeyCredentialCreationOptions,
    PublicKeyCredentialRequestOptions, RegisterPublicKeyCredential, RelyingParty, User,
    UserVerificationPolicy,
};

use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::Mutex;

static PASSKEYS: Lazy<Mutex<HashMap<Vec<u8>, SoftPasskey>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Clone)]
pub struct SoftPasskeyOperations {}

impl SoftPasskeyOperations {
    pub fn new() -> Self {
        Self {}
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl WebauthnOperations for SoftPasskeyOperations {
    async fn get_assertion(
        &self,
        rp_id: String,
        credential_id: CredentialID,
        challenge: &[u8],
    ) -> Result<PublicKeyCredential, crate::signers::DeviceError> {
        let mut passkeys = PASSKEYS.lock().unwrap();
        let pk = passkeys
            .get_mut(credential_id.as_slice())
            .ok_or(DeviceError::GetAssertion(
                "No passkey available for this credential ID".to_string(),
            ))?;

        let options = PublicKeyCredentialRequestOptions {
            challenge: Base64UrlSafeData::from(challenge),
            timeout: Some(500),
            rp_id,
            allow_credentials: vec![AllowCredentials {
                type_: "public-key".to_string(),
                id: Base64UrlSafeData::from(credential_id),
                transports: None,
            }],
            user_verification: UserVerificationPolicy::Required,
            hints: None,
            extensions: None,
        };
        let client_data = CollectedClientData {
            type_: "webauthn.get".to_string(),
            challenge: Base64UrlSafeData::from(challenge),
            origin: "https://cartridge.gg".try_into().unwrap(),
            token_binding: None,
            cross_origin: Some(false),
            unknown_keys: Default::default(),
        };
        let client_data_str = serde_json::to_string(&client_data)
            .map_err(|e| DeviceError::GetAssertion(format!("{:?}", e)))?;

        let client_data: Vec<u8> = client_data_str.clone().into();
        let client_data_hash = compute_sha256(&client_data).to_vec();
        let mut cred = AuthenticatorBackendHashedClientData::perform_auth(
            pk,
            client_data_hash,
            options,
            500_u32,
        )
        .map_err(|e| DeviceError::GetAssertion(format!("{:?}", e)))?;
        cred.response.client_data_json = Base64UrlSafeData::from(client_data);

        Ok(cred)
    }

    async fn create_credential(
        rp_id: String,
        user_name: String,
        challenge: &[u8],
    ) -> Result<RegisterPublicKeyCredential, crate::signers::DeviceError> {
        let mut pk = SoftPasskey::new(true);
        let r = AuthenticatorBackend::perform_register(
            &mut pk,
            "https://cartridge.gg".try_into().unwrap(),
            PublicKeyCredentialCreationOptions {
                rp: RelyingParty {
                    name: "Cartridge".to_string(),
                    id: rp_id,
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
            },
            500_u32,
        )
        .map_err(|e| DeviceError::CreateCredential(format!("{:?}", e)))?;

        let ao =
            AttestationObject::<Registration>::try_from(r.response.attestation_object.as_ref())
                .map_err(|e| DeviceError::CreateCredential(format!("CoseError: {:?}", e)))?;

        let cred = ao.auth_data.acd.unwrap();

        PASSKEYS
            .lock()
            .unwrap()
            .insert(cred.credential_id.clone().into(), pk);

        Ok(r)
    }
}

pub async fn test_verify_execute<S: HashSigner + Clone + Sync + Send>(signer: S) {
    let runner = KatanaRunner::load();
    let controller = runner.deploy_controller(&signer).await;
    let new_account = ContractAddress(felt!("0x18301129"));
    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, &controller);

    contract_erc20
        .balanceOf(&new_account)
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    contract_erc20
        .transfer(
            &new_account,
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}

// #[tokio::test]
// async fn test_verify_execute_webautn() {
//     test_verify_execute(SoftPasskeyOperations::new(
//         "localhost".to_string(),
//         "rp_id".to_string(),
//     ))
//     .await;
// }

#[tokio::test]
async fn test_verify_execute_starknet() {
    test_verify_execute(StarkSigningKey::from_random()).await;
}
