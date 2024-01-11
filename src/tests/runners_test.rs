use super::runners::{devnet_runner::DevnetRunner, katana_runner::KatanaRunner, TestnetRunner};

#[test]
fn test_katana_runner() {
    KatanaRunner::load();
}

#[test]
fn test_devnet_runner() {
    DevnetRunner::load();
}
