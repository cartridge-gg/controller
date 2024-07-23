use async_trait::async_trait;
use starknet::accounts::{ExecutionEncoding, SingleOwnerAccount};
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::JsonRpcClient;
use starknet::signers::LocalWallet;
use starknet::{core::types::Felt, macros::felt, signers::SigningKey};
use std::process::{Command, Stdio};
use url::Url;

use lazy_static::lazy_static;

use crate::tests::deploy_contract::single_owner_account_with_encoding;

use super::{find_free_port, SubprocessRunner, TestnetConfig, TestnetRunner};

lazy_static! {
    // Signing key and address of the katana prefunded account.
    pub static ref PREFUNDED: (SigningKey, Felt) = (
        SigningKey::from_secret_scalar(
            felt!(
                "0x2bbf4f9fd0bbb2e60b0316c1fe0b76cf7a4d0198bd493ced9b8df2a3a24d68a"
            ),
        ),
        felt!(
            "0xb3ff441a68610b30fd5e2abbf3a1548eb6ba6f3559f2862bf2dc757e5828ca"
        )
    );

    pub static ref CONFIG: TestnetConfig = TestnetConfig{
        port: 1234,
        exec: "katana".to_string(),
        log_file_path: "log/katana.log".to_string(),
    };
}

#[derive(Debug)]
pub struct KatanaRunner {
    testnet: SubprocessRunner,
    client: JsonRpcClient<HttpTransport>,
}

impl KatanaRunner {
    pub fn new(config: TestnetConfig) -> Self {
        let child = Command::new(config.exec)
            .args(["-p", &config.port.to_string()])
            .args(["--json-log"])
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to start subprocess");

        let testnet = SubprocessRunner::new(child, config.log_file_path, |l| {
            l.contains(r#""target":"katana::cli""#)
        });

        let client = JsonRpcClient::new(HttpTransport::new(
            Url::parse(&format!("http://0.0.0.0:{}/", config.port)).unwrap(),
        ));

        KatanaRunner { testnet, client }
    }
}

#[async_trait]
impl TestnetRunner for KatanaRunner {
    fn load() -> Self {
        KatanaRunner::new(CONFIG.clone().port(find_free_port()))
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
            ExecutionEncoding::New,
        )
        .await
    }
}

impl Drop for KatanaRunner {
    fn drop(&mut self) {
        self.testnet.kill();
    }
}
