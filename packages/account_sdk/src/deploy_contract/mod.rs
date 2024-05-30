pub(crate) mod declaration;
mod deployment;
mod pending;
pub use declaration::AccountDeclaration;
pub use deployment::AccountDeployment;
pub use deployment::DeployResult;
use lazy_static::lazy_static;
use starknet::accounts::{ExecutionEncoding, SingleOwnerAccount};
use starknet::core::types::{BlockId, BlockTag};
use starknet::macros::felt;
use starknet::providers::{JsonRpcClient, Provider};
use starknet::signers::LocalWallet;
use starknet::{core::types::FieldElement, signers::SigningKey};

lazy_static! {
    pub static ref UDC_ADDRESS: FieldElement =
        felt!("0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf");
    pub static ref FEE_TOKEN_ADDRESS: FieldElement =
        felt!("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7");
    pub static ref ERC20_CONTRACT_CLASS_HASH: FieldElement =
        felt!("0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f");
    pub static ref CHAIN_ID: FieldElement =
        felt!("0x00000000000000000000000000000000000000000000000000004b4154414e41");
}

pub async fn single_owner_account<'a, T>(
    client: &'a JsonRpcClient<T>,
    signing_key: SigningKey,
    account_address: FieldElement,
) -> SingleOwnerAccount<&'a JsonRpcClient<T>, LocalWallet>
where
    &'a JsonRpcClient<T>: Provider,
    T: Send + Sync,
{
    single_owner_account_with_encoding(client, signing_key, account_address, ExecutionEncoding::New)
        .await
}
pub async fn single_owner_account_with_encoding<'a, T>(
    client: &'a JsonRpcClient<T>,
    signing_key: SigningKey,
    account_address: FieldElement,
    encoding: ExecutionEncoding,
) -> SingleOwnerAccount<&'a JsonRpcClient<T>, LocalWallet>
where
    &'a JsonRpcClient<T>: Provider,
    T: Send + Sync,
{
    let chain_id = client.chain_id().await.unwrap();

    let mut account = SingleOwnerAccount::new(
        client,
        LocalWallet::from(signing_key),
        account_address,
        chain_id,
        encoding,
    );

    account.set_block_id(BlockId::Tag(BlockTag::Pending)); // For fetching valid nonce
    account
}
