use std::{
    net::TcpListener,
    path::{Path, PathBuf},
    process::Child,
};

use serde::Deserialize;
use starknet::{
    accounts::SingleOwnerAccount,
    providers::{jsonrpc::HttpTransport, JsonRpcClient},
    signers::LocalWallet,
};

use self::waiter::OutputWaiter;
use async_trait::async_trait;

pub mod devnet_runner;
pub mod katana_runner;
pub mod waiter;

#[async_trait]
pub trait TestnetRunner {
    fn load() -> Self;
    fn client(&self) -> &JsonRpcClient<HttpTransport>;
    async fn prefunded_single_owner_account(
        &self,
    ) -> SingleOwnerAccount<&JsonRpcClient<HttpTransport>, LocalWallet>;
}

#[derive(Debug)]
struct SubprocessRunner {
    child: Child,
}

impl SubprocessRunner {
    pub fn new(
        mut child: Child,
        log_file_path: impl Into<String>,
        line_predicate: impl (Fn(&str) -> bool) + Send + 'static,
    ) -> Self {
        let stdout = child
            .stdout
            .take()
            .expect("failed to take subprocess stdout");
        OutputWaiter::new(log_file_path.into(), stdout).wait(line_predicate);
        Self { child }
    }
    pub fn kill(&mut self) {
        if let Err(e) = self.child.kill() {
            eprintln!("Failed to kill katana subprocess: {}", e);
        }
        if let Err(e) = self.child.wait() {
            eprintln!("Failed to wait for katana subprocess: {}", e);
        }
    }
}

pub fn find_free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .unwrap()
        .local_addr()
        .unwrap()
        .port()
}

#[derive(Debug, Clone, Deserialize)]
pub struct TestnetConfig {
    pub port: u16,
    pub exec: String,
    pub log_file_path: String,
}

impl TestnetConfig {
    pub fn port(mut self, port: u16) -> Self {
        self.port = port;
        self.log_file_path = TestnetConfig::add_port_to_filename(&self.log_file_path, port);
        self
    }

    fn add_port_to_filename(file_path: &str, port: u16) -> String {
        let path = Path::new(file_path);
        let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("");
        let extension = path.extension().and_then(|s| s.to_str()).unwrap_or("");

        let new_file_name = if extension.is_empty() {
            format!("{}_{}", stem, port)
        } else {
            format!("{}_{}.{}", stem, port, extension)
        };
        let mut new_path = PathBuf::from(path.parent().unwrap_or_else(|| Path::new("")));
        new_path.push(new_file_name);
        new_path.to_string_lossy().into_owned()
    }
}
