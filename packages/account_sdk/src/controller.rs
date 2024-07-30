use crate::account::session::hash::{AllowedMethod, Session};
use crate::account::{AccountHashAndCallsSigner, SpecificAccount};
use crate::hash::MessageHashRev1;
use crate::impl_account;
use crate::storage::StorageBackend;
use crate::{
    abigen::{self},
    account::{AccountHashSigner, OwnerAccount},
    signers::{HashSigner, SignError},
};
use async_trait::async_trait;
use starknet::{
    accounts::{Account, Call, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
    providers::Provider,
    signers::SigningKey,
};

pub struct Controller<P, S, G, SB>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
    SB: StorageBackend,
{
    account: OwnerAccount<P, S, G>,
    contract: abigen::controller::Controller<OwnerAccount<P, S, G>>,
    storage: SB,
}

impl<P, S, G, SB> Controller<P, S, G, SB>
where
    P: Provider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    G: HashSigner + Send + Sync + Clone,
    SB: StorageBackend,
{
    pub fn new(
        provider: P,
        signer: S,
        guardian: G,
        address: Felt,
        chain_id: Felt,
        storage: SB,
    ) -> Self {
        let account = OwnerAccount::new(provider, signer, guardian, address, chain_id);
        Self {
            account: account.clone(),
            contract: abigen::controller::Controller::new(address, account),
            storage,
        }
    }

    pub async fn create_session(
        &self,
        methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<(Vec<Felt>, Felt), SignError> {
        let signer = SigningKey::from_random();
        let session = Session::new(methods, expires_at, &signer.signer())?;
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.account.chain_id, self.account.address);
        let authorization = self.account.sign_hash(hash).await?;
        Ok((authorization, signer.secret_scalar()))
    }

    pub async fn execute_from_outside(
        &self,
        _calls: Vec<Call>,
        _caller: Felt,
        _execute_after: u64,
        _execute_before: u64,
        _nonce: Felt,
    ) -> Result<Vec<Felt>, SignError> {
        unimplemented!();
    }

    pub async fn delegate_account(&self) -> Result<Felt, starknet::providers::ProviderError> {
        unimplemented!();
    }
}

impl_account!(Controller<P: Provider, S: HashSigner, G: HashSigner, SB: StorageBackend>);

impl<P, S, G, SB> ConnectedAccount for Controller<P, S, G, SB>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
    SB: StorageBackend,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        self.account.provider()
    }

    fn block_id(&self) -> BlockId {
        self.account.block_id()
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G, SB> AccountHashAndCallsSigner for Controller<P, S, G, SB>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
    SB: StorageBackend,
    OwnerAccount<P, S, G>: AccountHashAndCallsSigner,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        self.account.sign_hash_and_calls(hash, calls).await
    }
}

impl<P, S, G, SB> ExecutionEncoder for Controller<P, S, G, SB>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
    SB: StorageBackend,
{
    fn encode_calls(&self, calls: &[Call]) -> Vec<Felt> {
        self.account.encode_calls(calls)
    }
}

#[async_trait]
impl<P, S, G, SB> AccountHashSigner for Controller<P, S, G, SB>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
    SB: StorageBackend,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        self.account.sign_hash(hash).await
    }
}

impl<P, S, G, SB> SpecificAccount for Controller<P, S, G, SB>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
    SB: StorageBackend,
{
    fn address(&self) -> Felt {
        self.account.address
    }

    fn chain_id(&self) -> Felt {
        self.account.chain_id
    }
}
