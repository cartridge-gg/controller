use crate::signers::webauthn::WebauthnOperations;
use crate::signers::DeviceError;

use async_trait::async_trait;
use base64urlsafedata::Base64UrlSafeData;
use once_cell::sync::Lazy;
use sha2::{digest::Update, Digest, Sha256};
use std::collections::HashMap;
use std::sync::Mutex;
use webauthn_authenticator_rs::authenticator_hashed::AuthenticatorBackendHashedClientData;
use webauthn_authenticator_rs::softpasskey::SoftPasskey;
use webauthn_authenticator_rs::AuthenticatorBackend;
use webauthn_rs_core::proto::{AttestationObject, Registration};
use webauthn_rs_proto::{
    CollectedClientData, PublicKeyCredential, PublicKeyCredentialCreationOptions,
    PublicKeyCredentialRequestOptions, RegisterPublicKeyCredential,
};

#[cfg(test)]
#[path = "softpasskey_test.rs"]
mod softpasskey_test;

static PASSKEYS: Lazy<Mutex<HashMap<Vec<u8>, SoftPasskey>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

use url::Url;

static ORIGIN: Lazy<Mutex<Url>> =
    Lazy::new(|| Mutex::new(Url::parse("https://cartridge.gg").unwrap()));

#[derive(Clone, Debug)]
pub struct SoftPasskeyOperations {}

impl SoftPasskeyOperations {
    pub fn new(origin: Url) -> Self {
        let mut global_origin = ORIGIN.lock().unwrap();
        *global_origin = origin;

        Self {}
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl WebauthnOperations for SoftPasskeyOperations {
    async fn get_assertion(
        &self,
        options: PublicKeyCredentialRequestOptions,
    ) -> Result<PublicKeyCredential, crate::signers::DeviceError> {
        let mut passkeys = PASSKEYS.lock().unwrap();
        let pk = passkeys
            .get_mut(options.allow_credentials[0].id.as_slice())
            .ok_or(DeviceError::GetAssertion(
                "No passkey available for this credential ID".to_string(),
            ))?;

        let client_data = CollectedClientData {
            type_: "webauthn.get".to_string(),
            challenge: options.challenge.clone(),
            origin: ORIGIN.lock().unwrap().clone(),
            token_binding: None,
            cross_origin: Some(false),
            unknown_keys: Default::default(),
        };
        let client_data_str = serde_json::to_string(&client_data)
            .map_err(|e| DeviceError::GetAssertion(format!("{:?}", e)))?;

        let client_data_hash = Sha256::new().chain(client_data_str.clone()).finalize();
        let mut cred = AuthenticatorBackendHashedClientData::perform_auth(
            pk,
            client_data_hash.to_vec(),
            options,
            500_u32,
        )
        .map_err(|e| DeviceError::GetAssertion(format!("{:?}", e)))?;
        cred.response.client_data_json = Base64UrlSafeData::from(client_data_str.as_bytes());

        Ok(cred)
    }

    async fn create_credential(
        &self,
        options: PublicKeyCredentialCreationOptions,
    ) -> Result<RegisterPublicKeyCredential, crate::signers::DeviceError> {
        let mut pk = SoftPasskey::new(true);
        let r = AuthenticatorBackend::perform_register(
            &mut pk,
            ORIGIN.lock().unwrap().clone(),
            options,
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

    fn origin(&self) -> Result<String, DeviceError> {
        Ok(ORIGIN.lock().unwrap().clone().to_string())
    }
}
