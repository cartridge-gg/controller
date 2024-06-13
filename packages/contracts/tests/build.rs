use core::panic;
use std::{
    env,
    io::{self, Write as _},
    process::Command,
};

fn main() {
    let curr_dir = env::current_dir().expect("Failed to get current directory");
    assert!(curr_dir.ends_with("webauthn/tests"));

    // TODO: Compile each crate separately and concurrently
    let output = Command::new("scarb")
        .current_dir("../")
        .arg("build")
        .output()
        .expect("Failed to execute 'scarb build' command");

    if output.status.success() {
        io::stderr().write_all(&output.stderr).unwrap();
    } else {
        io::stderr().write_all(&output.stdout).unwrap();
        io::stderr().write_all(&output.stderr).unwrap();
        panic!("Command executed with error status: {}", output.status);
    }
    // This makes sure that the cairo code is compiled again when a change occurs
    // It's important since we always want to test against the latest version of the code
    println!("cargo:rerun-if-changed=../auth");
    println!("cargo:rerun-if-changed=../session");
    println!("cargo:rerun-if-changed=../../../Scarb.toml");
}
