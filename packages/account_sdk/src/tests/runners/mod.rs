use std::{net::TcpListener, process::Child};

use serde::Deserialize;
use starknet_crypto::Felt;

use self::waiter::OutputWaiter;

pub mod cartridge;
pub mod katana;
pub mod waiter;

#[derive(Debug)]
struct SubprocessRunner {
    child: Child,
}

impl SubprocessRunner {
    pub fn new(mut child: Child, line_predicate: impl (Fn(&str) -> bool) + Send + 'static) -> Self {
        let stdout = child
            .stdout
            .take()
            .expect("failed to take subprocess stdout");
        OutputWaiter::new(stdout).wait(line_predicate);
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
    pub chain_id: Felt,
    pub exec: String,
    #[allow(dead_code)]
    pub log_file_path: String,
}
