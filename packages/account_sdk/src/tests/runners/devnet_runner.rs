use async_trait::async_trait;
use starknet::accounts::{ExecutionEncoding, SingleOwnerAccount};
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::JsonRpcClient;
use starknet::signers::LocalWallet;
use starknet::{core::types::Felt, macros::felt, signers::SigningKey};
use std::process::{Command, Stdio};
use url::Url;

use lazy_static::lazy_static;

use crate::deploy_contract::single_owner_account_with_encoding;

use super::{find_free_port, SubprocessRunner, TestnetConfig, TestnetRunner};

lazy_static! {
    // Signing key and address of the devnet prefunded account.
    pub static ref PREFUNDED: (SigningKey, Felt) = (
        SigningKey::from_secret_scalar(felt!("0x71d7bb07b9a64f6f78ac4c816aff4da9"),),
        felt!("0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691")
    );

    pub static ref CONFIG: TestnetConfig = TestnetConfig{
        port: 5050,
        exec: "starknet-devnet".to_string(),
        log_file_path: "log/devnet.log".to_string(),
    };
}

#[derive(Debug)]
pub struct DevnetRunner {
    testnet: SubprocessRunner,
    client: JsonRpcClient<HttpTransport>,
}

impl DevnetRunner {
    pub fn new(config: TestnetConfig) -> Self {
        let child = Command::new(config.exec)
            .args(["--port", &config.port.to_string()])
            .args(["--seed", "0"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("failed to start subprocess");

        let testnet = SubprocessRunner::new(child, config.log_file_path, |l| {
            l.contains(r"Starknet Devnet listening on")
        });

        let client = JsonRpcClient::new(HttpTransport::new(
            Url::parse(&format!("http://0.0.0.0:{}/", config.port)).unwrap(),
        ));

        DevnetRunner { testnet, client }
    }
}

#[async_trait]
impl TestnetRunner for DevnetRunner {
    fn load() -> Self {
        DevnetRunner::new(CONFIG.clone().port(find_free_port()))
    }
    fn client(&self) -> &JsonRpcClient<HttpTransport> {
        &self.client
    }
    async fn prefunded_single_owner_account(
        &self,
    ) -> SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet> {
        single_owner_account_with_encoding(
            &self.client,
            PREFUNDED.0.clone(),
            PREFUNDED.1,
            ExecutionEncoding::Legacy,
        )
        .await
    }
}

impl Drop for DevnetRunner {
    fn drop(&mut self) {
        self.testnet.kill();
    }
}
