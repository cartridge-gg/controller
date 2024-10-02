use cainome::cairo_serde::{CairoSerde, NonZero};
use starknet::accounts::ConnectedAccount;
use starknet::core::types::{Call, Felt, InvokeTransactionResult};
use starknet::signers::{SigningKey, VerifyingKey};

use crate::abigen::controller::{Signer as AbigenSigner, SignerSignature, StarknetSigner};
use crate::account::session::hash::{Policy, Session};
use crate::account::session::SessionAccount;
use crate::controller::Controller;
use crate::errors::ControllerError;
use crate::hash::MessageHashRev1;
use crate::signers::{HashSigner, Signer, SignerTrait};
use crate::storage::{Credentials, Selectors, SessionMetadata};
use crate::utils::time::get_current_timestamp;
use crate::Backend;

#[cfg(test)]
#[path = "session_test.rs"]
mod session_test;

impl<B> Controller<B>
where
    B: Backend + Clone,
{
    pub async fn create_session(
        &mut self,
        methods: Vec<Policy>,
        expires_at: u64,
    ) -> Result<SessionAccount, ControllerError> {
        let signer = SigningKey::from_random();
        let session = Session::new(methods, expires_at, &signer.signer())?;
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id, self.address);
        let authorization = self.owner.sign(&hash).await?;
        let authorization = Vec::<SignerSignature>::cairo_serialize(&vec![authorization.clone()]);
        self.backend.set_session(
            &Selectors::session(&self.address, &self.app_id, &self.chain_id),
            SessionMetadata {
                session: session.clone(),
                max_fee: None,
                credentials: Some(Credentials {
                    authorization: authorization.clone(),
                    private_key: signer.secret_scalar(),
                }),
                is_registered: false,
            },
        )?;

        let session_signer = Signer::Starknet(signer);
        let session_account = SessionAccount::new(
            self.provider().clone(),
            session_signer,
            self.address,
            self.chain_id,
            authorization,
            session,
        );

        Ok(session_account)
    }

    pub fn register_session_call(
        &mut self,
        methods: Vec<Policy>,
        expires_at: u64,
        public_key: Felt,
    ) -> Result<Call, ControllerError> {
        let pubkey = VerifyingKey::from_scalar(public_key);
        let signer = AbigenSigner::Starknet(StarknetSigner {
            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
        });
        let session = Session::new(methods, expires_at, &signer)?;
        let call = self
            .contract()
            .register_session_getcall(&session.raw(), &self.owner_guid());

        Ok(call)
    }

    pub async fn register_session(
        &mut self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: Felt,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let session = Session::new(
            policies,
            expires_at,
            &AbigenSigner::Starknet(StarknetSigner {
                pubkey: NonZero::new(public_key).unwrap(),
            }),
        )?;

        let txn = self
            .contract()
            .register_session(&session.raw(), &self.owner_guid())
            .max_fee(max_fee)
            .send()
            .await?;

        self.backend.set_session(
            &Selectors::session(&self.address, &self.app_id, &self.chain_id),
            SessionMetadata {
                session: session.clone(),
                max_fee: None,
                credentials: None,
                is_registered: true,
            },
        )?;

        Ok(txn)
    }

    pub fn session_metadata(
        &self,
        policies: &[Policy],
        public_key: Option<Felt>,
    ) -> Option<(String, SessionMetadata)> {
        let key: String = Selectors::session(&self.address, &self.app_id, &self.chain_id);
        self.backend
            .session(&key)
            .ok()
            .flatten()
            .and_then(|metadata| {
                let current_timestamp = get_current_timestamp();

                let session_key_guid = if let Some(public_key) = public_key {
                    let pubkey = VerifyingKey::from_scalar(public_key);
                    AbigenSigner::Starknet(StarknetSigner {
                        pubkey: NonZero::new(pubkey.scalar()).unwrap(),
                    })
                    .guid()
                } else if let Some(credentials) = &metadata.credentials {
                    let signer = SigningKey::from_secret_scalar(credentials.private_key);
                    AbigenSigner::Starknet(StarknetSigner {
                        pubkey: NonZero::new(signer.verifying_key().scalar()).unwrap(),
                    })
                    .guid()
                } else {
                    return None;
                };

                if metadata.session.expires_at > current_timestamp
                    && metadata.session.session_key_guid == session_key_guid
                    && policies
                        .iter()
                        .all(|policy| metadata.session.is_authorized(policy))
                {
                    Some((key, metadata))
                } else {
                    None
                }
            })
    }

    pub fn session_account(&self, calls: &[Call]) -> Option<SessionAccount> {
        // Check if there's a valid session stored
        let (_, metadata) = self.session_metadata(&Policy::from_calls(calls), None)?;
        let credentials = metadata.credentials.as_ref()?;
        let session_signer =
            Signer::Starknet(SigningKey::from_secret_scalar(credentials.private_key));
        let session_account = SessionAccount::new(
            self.provider().clone(),
            session_signer,
            self.address,
            self.chain_id,
            credentials.authorization.clone(),
            metadata.session,
        );

        Some(session_account)
    }
}
