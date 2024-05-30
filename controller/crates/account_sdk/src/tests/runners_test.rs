use super::runners::{katana_runner::KatanaRunner, TestnetRunner};

#[test]
fn test_katana_runner() {
    KatanaRunner::load();
}
