use cainome::cairo_serde::{CairoSerde, NonZero};
use starknet::accounts::ConnectedAccount;
use starknet::core::types::{Call, Felt, InvokeTransactionResult};
use starknet::signers::{SigningKey, VerifyingKey};

use crate::abigen::controller::{Signer as AbigenSigner, SignerSignature, StarknetSigner};
use crate::account::session::account::SessionAccount;
use crate::account::session::hash::Session;
use crate::account::session::policy::Policy;
use crate::controller::Controller;
use crate::errors::ControllerError;
use crate::hash::MessageHashRev1;
use crate::signers::{HashSigner, Signer};
use crate::storage::StorageBackend;
use crate::storage::{selectors::Selectors, Credentials, SessionMetadata};

#[cfg(all(test, not(target_arch = "wasm32")))]
#[path = "session_test.rs"]
mod session_test;

impl Controller {
    pub async fn create_session(
        &mut self,
        methods: Vec<Policy>,
        expires_at: u64,
    ) -> Result<SessionAccount, ControllerError> {
        self.create_session_with_guardian(methods, expires_at, Felt::ZERO)
            .await
    }

    pub async fn create_session_with_guardian(
        &mut self,
        methods: Vec<Policy>,
        expires_at: u64,
        guardian: Felt,
    ) -> Result<SessionAccount, ControllerError> {
        let signer = SigningKey::from_random();
        let session_signer = Signer::Starknet(signer.clone());

        let session = Session::new(
            methods,
            expires_at,
            &session_signer.clone().into(),
            guardian,
        )?;
        let hash = session
            .inner
            .get_message_hash_rev_1(self.chain_id, self.address);
        let authorization = self.owner.sign(&hash).await?;
        let authorization = Vec::<SignerSignature>::cairo_serialize(&vec![authorization.clone()]);
        self.storage.set_session(
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
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: Felt,
        guardian: Felt,
    ) -> Result<Call, ControllerError> {
        let pubkey = VerifyingKey::from_scalar(public_key);
        let signer = AbigenSigner::Starknet(StarknetSigner {
            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
        });
        let session = Session::new(policies, expires_at, &signer, guardian)?;
        let call = self
            .contract()
            .register_session_getcall(&session.into(), &self.owner_guid());

        Ok(call)
    }

    pub async fn register_session(
        &mut self,
        policies: Vec<Policy>,
        expires_at: u64,
        public_key: Felt,
        guardian: Felt,
        max_fee: Felt,
    ) -> Result<InvokeTransactionResult, ControllerError> {
        let session = Session::new(
            policies,
            expires_at,
            &AbigenSigner::Starknet(StarknetSigner {
                pubkey: NonZero::new(public_key).unwrap(),
            }),
            guardian,
        )?;

        let call = self
            .contract()
            .register_session_getcall(&session.clone().into(), &self.owner_guid());
        let txn = self.execute(vec![call], max_fee).await?;

        self.storage.set_session(
            &Selectors::session(&self.address, &self.app_id, &self.chain_id),
            SessionMetadata {
                session,
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
        self.storage
            .session(&key)
            .ok()
            .flatten()
            .filter(|metadata| metadata.is_valid(policies, public_key))
            .map(|metadata| (key, metadata))
    }

    pub fn session_account(&self, policies: &[Policy]) -> Option<SessionAccount> {
        // Check if there's a valid session stored
        let (_, metadata) = self.session_metadata(policies, None)?;
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
