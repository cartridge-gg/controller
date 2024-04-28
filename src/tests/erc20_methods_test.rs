use cainome::cairo_serde::{ContractAddress, U256};
use starknet::{
    accounts::Account,
    core::types::{BlockId, BlockTag},
    macros::felt,
};

use super::runners::katana_runner::KatanaRunner;
use crate::abigen::erc_20::{Erc20 as Erc20Contract, Erc20Reader};
use crate::{deploy_contract::FEE_TOKEN_ADDRESS, tests::runners::TestnetRunner};

#[tokio::test]
async fn test_balance_of() {
    let runner = KatanaRunner::load();
    let account = runner.prefunded_single_owner_account().await;

    let contract_erc20 = Erc20Reader::new(*FEE_TOKEN_ADDRESS, runner.client());

    contract_erc20
        .balanceOf(&ContractAddress(account.address()))
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");
}

#[tokio::test]
async fn test_transfer() {
    let runner = KatanaRunner::load();
    let new_account = felt!("0x18301129");
    let account = runner.prefunded_single_owner_account().await;

    let contract_erc20 = Erc20Contract::new(*FEE_TOKEN_ADDRESS, &account);

    contract_erc20
        .balanceOf(&ContractAddress(new_account))
        .block_id(BlockId::Tag(BlockTag::Latest))
        .call()
        .await
        .expect("failed to call contract");

    contract_erc20
        .transfer(
            &ContractAddress(new_account),
            &U256 {
                low: 0x10_u128,
                high: 0,
            },
        )
        .send()
        .await
        .unwrap();
}
