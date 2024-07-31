use crate::signers::webauthn::{WebauthnBackend, WebauthnSigner};
use crate::signers::DeviceError;
use crate::{
    abigen::erc_20::Erc20,
    signers::HashSigner,
    tests::{account::FEE_TOKEN_ADDRESS, runners::katana::KatanaRunner},
};
use async_trait::async_trait;
use base64urlsafedata::Base64UrlSafeData;
use cainome::cairo_serde::{ContractAddress, U256};
use sha2::{digest::Update, Digest, Sha256};
use starknet::{
    core::types::{BlockId, BlockTag},
    macros::felt,
    signers::SigningKey as StarkSigningKey,
};
use webauthn_authenticator_rs::authenticator_hashed::AuthenticatorBackendHashedClientData;
use webauthn_authenticator_rs::softpasskey::SoftPasskey;
use webauthn_authenticator_rs::AuthenticatorBackend;
use webauthn_rs_core::proto::{AttestationObject, Registration};
use webauthn_rs_proto::{
    CollectedClientData, PublicKeyCredential, PublicKeyCredentialCreationOptions,
    PublicKeyCredentialRequestOptions, RegisterPublicKeyCredential,
};

use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::Mutex;

static PASSKEYS: Lazy<Mutex<HashMap<Vec<u8>, SoftPasskey>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

use url::Url;

static ORIGIN: Lazy<Mutex<Url>> =
    Lazy::new(|| Mutex::new(Url::parse("https://cartridge.gg").unwrap()));

#[derive(Clone)]
pub struct SoftPasskeySigner {}
impl SoftPasskeySigner {
    #[allow(dead_code)]
    pub fn new(origin: Url) -> Self {
        let mut global_origin = ORIGIN.lock().unwrap();
        *global_origin = origin;

        Self {}
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl WebauthnBackend for SoftPasskeySigner {
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

    fn origin() -> Result<String, DeviceError> {
        Ok(ORIGIN.lock().unwrap().clone().to_string())
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

#[tokio::test]
async fn test_verify_execute_webautn() {
    let signer = WebauthnSigner::register(
        "cartridge.gg".to_string(),
        "username".to_string(),
        "challenge".as_bytes(),
        SoftPasskeySigner::new("https://cartridge.gg".try_into().unwrap()),
    )
    .await
    .unwrap();

    test_verify_execute(signer).await;
}

#[tokio::test]
async fn test_verify_execute_starknet() {
    test_verify_execute(StarkSigningKey::from_random()).await;
}
