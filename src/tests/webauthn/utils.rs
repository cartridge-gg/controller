use cainome::cairo_serde::{ContractAddress, NonZero, U256};
use starknet::{
    core::types::FieldElement,
    providers::{jsonrpc::HttpTransport, JsonRpcClient, Provider},
};

use crate::abigen::erc_20::Erc20 as Erc20Contract;
use crate::{
    abigen::cartridge_account::{
        CartridgeAccount as AbigenCartridgeAccount, CartridgeAccountReader, Signer, WebauthnSigner,
    },
    account::CartridgeAccount,
    deploy_contract::FEE_TOKEN_ADDRESS,
};
use crate::{signers::webauthn::p256r1::P256r1Signer, tests::runners::TestnetRunner};

use super::super::deployment_test::{declare, deploy};

pub struct WebauthnTestData<R> {
    pub runner: R,
    pub address: FieldElement,
    pub signer: P256r1Signer,
}

impl<R> WebauthnTestData<R>
where
    R: TestnetRunner,
{
    pub async fn new(p256r1_signer: P256r1Signer) -> Self {
        let runner = R::load();
        let prefunded = runner.prefunded_single_owner_account().await;
        let class_hash = declare(runner.client(), &prefunded).await;

        let pub_key = p256r1_signer.public_key().0;

        let signer = Signer::Webauthn(WebauthnSigner {
            origin: p256r1_signer.origin.clone().into_bytes(),
            pubkey: NonZero::new(pub_key.into()).unwrap(),
            rp_id_hash: NonZero::new(U256::from_bytes_be(&p256r1_signer.rp_id_hash())).unwrap(),
        });

        let address = deploy(runner.client(), &prefunded, signer, None, class_hash).await;

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
            signer: p256r1_signer,
        }
    }
    pub fn cartridge_account_reader(
        &self,
    ) -> CartridgeAccountReader<&JsonRpcClient<HttpTransport>> {
        CartridgeAccountReader::new(self.address, self.runner.client())
    }
    pub async fn webauthn_account(
        &self,
    ) -> CartridgeAccount<&JsonRpcClient<HttpTransport>, P256r1Signer> {
        CartridgeAccount::new(
            self.runner.client(),
            self.signer.clone(),
            self.address,
            self.runner.client().chain_id().await.unwrap(),
        )
    }
    pub async fn cartridge_account(
        &self,
    ) -> AbigenCartridgeAccount<CartridgeAccount<&JsonRpcClient<HttpTransport>, P256r1Signer>> {
        AbigenCartridgeAccount::new(self.address, self.webauthn_account().await)
    }
}
