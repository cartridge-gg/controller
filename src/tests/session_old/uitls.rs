use cainome::cairo_serde::ContractAddress;
use starknet::{
    accounts::{Account, ConnectedAccount, SingleOwnerAccount},
    macros::selector,
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
    signers::{LocalWallet, Signer, SigningKey},
};

use crate::session_token::SessionAccount;
use crate::tests::deployment_test::create_account;
use crate::{abigen::account::Call, tests::runners::TestnetRunner};

use crate::session_token::Session;

pub async fn create_session_account<T>(
    runner: &T,
) -> (
    SessionAccount<&JsonRpcClient<HttpTransport>, LocalWallet>,
    SigningKey,
    SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet>,
)
where
    T: TestnetRunner,
{
    let from = runner.prefunded_single_owner_account().await;
    let (provider, chain_id) = (*from.provider(), from.chain_id());

    let (master_account, master_key) = create_account(&from).await;

    let address = master_account.address();
    let cainome_address = ContractAddress::from(address);

    let call = Call {
        to: cainome_address,
        selector: selector!("revoke_session"),
        calldata: vec![],
    };
    let permited_calls = vec![call];

    let session_key = LocalWallet::from(SigningKey::from_random());
    let mut session = Session::new(session_key.get_public_key().await.unwrap(), u64::MAX);
    let session_hash = session
        .set_policy(
            permited_calls,
            master_account.chain_id(),
            master_account.address(),
        )
        .await
        .unwrap();

    let session_token = master_key.sign(&session_hash).unwrap();
    session.set_token(session_token);
    let session_account = SessionAccount::new(provider, session_key, session, address, chain_id);

    (session_account, master_key, master_account)
}
