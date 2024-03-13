use cainome::cairo_serde::ContractAddress;
use starknet::{
    accounts::{ConnectedAccount, Execution, SingleOwnerAccount},
    core::types::FieldElement,
    providers::{jsonrpc::HttpTransport, JsonRpcClient, Provider},
    signers::{LocalWallet, SigningKey},
};

use crate::{
    abigen::account::{CartridgeAccount, CartridgeAccountReader, WebauthnPubKey},
    deploy_contract::FEE_TOKEN_ADDRESS,
    transaction_waiter::TransactionWaiter,
    webauthn_signer::account::WebauthnAccount,
};
use crate::{
    abigen::erc20::{Erc20Contract, U256},
    webauthn_signer::cairo_args::pub_key_to_felts,
};
use crate::{
    deploy_contract::single_owner_account, tests::runners::TestnetRunner,
    webauthn_signer::P256r1Signer,
};

use super::super::deployment_test::{declare, deploy};

pub struct WebauthnTestData<R> {
    pub runner: R,
    pub address: FieldElement,
    pub private_key: SigningKey,
    pub signer: P256r1Signer,
}

impl<R> WebauthnTestData<R>
where
    R: TestnetRunner,
{
    pub async fn new(private_key: SigningKey, signer: P256r1Signer) -> Self {
        let runner = R::load();
        let prefunded = runner.prefunded_single_owner_account().await;
        let class_hash = declare(runner.client(), &prefunded).await;

        let address = deploy(
            runner.client(),
            &prefunded,
            private_key.verifying_key().scalar(),
            class_hash,
        )
        .await;

        let erc20_prefunded = Erc20Contract::new(*FEE_TOKEN_ADDRESS, prefunded);

        erc20_prefunded
            .transfer(
                &ContractAddress(address),
                &U256 {
                    low: 0x8944000000000000_u128,
                    high: 0,
                },
            )
            .send()
            .await
            .unwrap();

        Self {
            runner,
            address,
            private_key,
            signer,
        }
    }
    async fn single_owner_account(
        &self,
    ) -> SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet> {
        single_owner_account(self.runner.client(), self.private_key.clone(), self.address).await
    }
    pub fn webauthn_public_key(
        &self,
    ) -> ((FieldElement, FieldElement), (FieldElement, FieldElement)) {
        pub_key_to_felts(self.signer.public_key_bytes())
    }
    pub async fn set_webauthn_public_key(&self) {
        let (pub_x, pub_y) = self.webauthn_public_key();
        let account = self.single_owner_account().await;
        let new_account_executor = self.single_owner_executor().await;
        let set_execution: Execution<'_, _> =
            new_account_executor.set_webauthn_pub_key(&WebauthnPubKey {
                x: pub_x.into(),
                y: pub_y.into(),
            });
        let max_fee = set_execution.estimate_fee().await.unwrap().overall_fee * FieldElement::TWO;
        let set_execution = set_execution
            .nonce(account.get_nonce().await.unwrap())
            .max_fee(FieldElement::from(max_fee))
            .prepared()
            .unwrap();
        let set_tx = set_execution.transaction_hash(false);

        set_execution.send().await.unwrap();

        TransactionWaiter::new(set_tx, self.runner.client())
            .wait()
            .await
            .unwrap();
    }
    pub fn account_reader(&self) -> CartridgeAccountReader<&JsonRpcClient<HttpTransport>> {
        CartridgeAccountReader::new(self.address, self.runner.client())
    }
    pub async fn single_owner_executor(
        &self,
    ) -> CartridgeAccount<SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet>> {
        CartridgeAccount::new(self.address, self.single_owner_account().await)
    }
    pub async fn webauthn_executor(
        &self,
    ) -> CartridgeAccount<WebauthnAccount<&JsonRpcClient<HttpTransport>>> {
        CartridgeAccount::new(
            self.address,
            WebauthnAccount::new(
                self.runner.client(),
                self.signer.clone(),
                self.address,
                self.runner.client().chain_id().await.unwrap(),
            ),
        )
    }
}
