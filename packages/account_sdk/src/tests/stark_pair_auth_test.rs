use cainome::cairo_serde::{ContractAddress, NonZero, U256};
use starknet::{accounts::Account, signers::SigningKey};

use crate::abigen::controller::{Controller, Signer, StarknetSigner};
use crate::abigen::erc_20::Erc20;
use crate::{
    deploy_contract::{single_owner_account, FEE_TOKEN_ADDRESS},
    tests::runners::TestnetRunner,
};

use super::deployment_test::{declare, deploy};
use super::runners::katana_runner::KatanaRunner;

#[tokio::test]
async fn test_authorize_execute() {
    let runner = KatanaRunner::load();
    let prefunded = runner.prefunded_single_owner_account().await;
    let class_hash = declare(runner.client(), &prefunded).await;
    let private_key = SigningKey::from_random();
    let signer = Signer::Starknet(StarknetSigner {
        pubkey: NonZero::new(private_key.verifying_key().scalar()).unwrap(),
    });
    let deployed_address = deploy(runner.client(), &prefunded, signer, None, class_hash).await;

    let new_account = single_owner_account(runner.client(), private_key, deployed_address).await;

    let contract_erc20 = Erc20::new(*FEE_TOKEN_ADDRESS, prefunded);
    let new_account = Controller::new(deployed_address, &new_account);

    let amount = U256 {
        low: 0x8944000000000000_u128,
        high: 0,
    };

    contract_erc20
        .transfer(&ContractAddress(new_account.account.address()), &amount)
        .send()
        .await
        .unwrap();

    new_account.get_owner().call().await.unwrap();
}
