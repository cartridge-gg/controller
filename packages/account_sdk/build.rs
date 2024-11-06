use cainome::rs::Abigen;
use starknet::core::types::Felt;
use std::{collections::HashMap, fs, path::PathBuf, process::Command};

fn main() {
    println!("cargo:rerun-if-changed=./artifacts/classes");
    generate_controller_bindings();
    generate_erc20_bindings();
    generate_artifacts();
    Command::new("cargo")
        .args(["fmt", "--all"])
        .status()
        .expect("Failed to format the code");
}

fn generate_artifacts() {
    let mut controllers = String::new();
    let mut versions = Vec::new();

    for entry in fs::read_dir("./artifacts/classes").unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() && path.extension().unwrap_or_default() == "json" {
            let filename = path.file_name().unwrap().to_str().unwrap();
            if filename.starts_with("controller.") && filename.ends_with(".contract_class.json") {
                let version = filename
                    .strip_prefix("controller.")
                    .unwrap()
                    .strip_suffix(".contract_class.json")
                    .unwrap();
                versions.push(version.to_string());

                controllers.push_str(&format!(
                    r#"m.insert(Version::{}, ContractClass {{
            content: include_str!(".{}"),
            hash: felt!("{:#x}"),
            casm_hash: felt!("{:#x}"),
        }});"#,
                    version.replace('.', "_").to_uppercase(),
                    // Replace the '\' with '/' on Windows, meaning the path is always the same
                    // on all platforms. Windows also accepts '/' as a path separator.
                    path.display().to_string().replace("\\", "/"),
                    extract_class_hash(&path),
                    extract_compiled_class_hash(version)
                ));
            }
        }
    }

    // Sort to ensure output is deterministic
    versions.sort_by(|a, b| {
        if a == "latest" {
            std::cmp::Ordering::Greater
        } else if b == "latest" {
            std::cmp::Ordering::Less
        } else {
            let a_parts: Vec<&str> = a.trim_start_matches('v').split('.').collect();
            let b_parts: Vec<&str> = b.trim_start_matches('v').split('.').collect();
            for (a_part, b_part) in a_parts.iter().zip(b_parts.iter()) {
                let a_num: u32 = a_part.parse().unwrap();
                let b_num: u32 = b_part.parse().unwrap();
                match a_num.cmp(&b_num) {
                    std::cmp::Ordering::Equal => continue,
                    other => return other,
                }
            }
            a_parts.len().cmp(&b_parts.len())
        }
    });

    let latest_version = versions.iter().max().unwrap();
    let artifacts = format!(
        r#"// This file is auto-generated. Do not modify manually.
use lazy_static::lazy_static;
use std::collections::HashMap;
use starknet_types_core::felt::Felt;
use starknet::macros::felt;

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum Version {{
    {enum_variants}
}}

#[derive(Clone, Copy)]
pub struct ContractClass {{
    pub content: &'static str,
    pub hash: Felt,
    pub casm_hash: Felt,
}}

unsafe impl Sync for ContractClass {{}}

lazy_static! {{
    pub static ref CONTROLLERS: HashMap<Version, ContractClass> = {{
        let mut m = HashMap::new();
        {controllers}
        m
    }};

    pub static ref DEFAULT_CONTROLLER: &'static ContractClass = CONTROLLERS.get(&Version::{default_version}).unwrap();

    pub static ref VERSIONS: Vec<Version> = vec![
        {versions}
    ];
}}
"#,
        enum_variants = versions
            .iter()
            .map(|v| v.replace('.', "_").to_uppercase().to_string())
            .collect::<Vec<_>>()
            .join(", "),
        controllers = controllers,
        default_version = latest_version.replace('.', "_").to_uppercase(),
        versions = versions
            .iter()
            .map(|v| format!("Version::{}", v.replace('.', "_").to_uppercase()))
            .collect::<Vec<_>>()
            .join(", ")
    );

    fs::write("./src/artifacts.rs", artifacts).unwrap();
    // Write artifacts to JSON file
    let json_artifacts = serde_json::json!({
        "versions": versions,
        "latest_version": latest_version,
        "controllers": versions.iter().map(|v| {
            (v.to_string(), {
                let path = format!("./artifacts/classes/controller.{}.contract_class.json", v);
                let class_hash = extract_class_hash(&PathBuf::from(&path));
                let casm_hash = extract_compiled_class_hash(v);
                serde_json::json!({  // <-- Add json! macro here
                    "class_hash": format!("{:#x}", class_hash),
                    "casm_hash": format!("{:#x}", casm_hash)
                })
            })
        }).collect::<HashMap<_,_>>()
    });

    fs::write(
        "./artifacts/metadata.json",
        serde_json::to_string_pretty(&json_artifacts).unwrap(),
    )
    .unwrap();
}

fn extract_compiled_class_hash(version: &str) -> Felt {
    use starknet::core::types::contract::CompiledClass;
    use std::fs::File;
    use std::io::BufReader;
    let compiled_class: CompiledClass = serde_json::from_reader(BufReader::new(
        File::open(format!(
            "./artifacts/classes/controller.{version}.compiled_contract_class.json"
        ))
        .unwrap(),
    ))
    .unwrap();
    compiled_class.class_hash().unwrap()
}

fn extract_class_hash(path: &PathBuf) -> Felt {
    use starknet::core::types::contract::SierraClass;
    use std::fs::File;
    use std::io::BufReader;
    let compiled_class: SierraClass =
        serde_json::from_reader(BufReader::new(File::open(path).unwrap())).unwrap();
    compiled_class.class_hash().unwrap()
}

fn generate_controller_bindings() {
    let abigen = Abigen::new(
        "Controller",
        "./artifacts/classes/controller.latest.contract_class.json",
    )
    .with_types_aliases(HashMap::from([
        (
            String::from(
                "argent::outside_execution::outside_execution::outside_execution_component::Event",
            ),
            String::from("OutsideExecutionV3Event"),
        ),
        (
            String::from("argent::outside_execution::interface::OutsideExecution"),
            String::from("OutsideExecutionV3"),
        ),
        (
            String::from("controller::account::CartridgeAccount::Event"),
            String::from("ControllerEvent"),
        ),
        (
            String::from(
                "controller::external_owners::external_owners::external_owners_component::Event",
            ),
            String::from("ExternalOwnersEvent"),
        ),
        (
            String::from(
                "controller::delegate_account::delegate_account::delegate_account_component::Event",
            ),
            String::from("DelegateAccountEvent"),
        ),
        (
            String::from("controller::session::session::session_component::Event"),
            String::from("SessionEvent"),
        ),
        (
            String::from(
                "controller::multiple_owners::multiple_owners::multiple_owners_component::Event",
            ),
            String::from("MultipleOwnersEvent"),
        ),
        (
            String::from("controller::introspection::src5::src5_component::Event"),
            String::from("Src5ComponentEvent"),
        ),
        (
            String::from("openzeppelin::token::erc20::erc20::ERC20Component::Event"),
            String::from("ERC20ComponentEvent"),
        ),
        (
            String::from("openzeppelin::access::ownable::ownable::OwnableComponent::Event"),
            String::from("OwnableComponentEvent"),
        ),
        (
            String::from("openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event"),
            String::from("UpgradeEvent"),
        ),
        (
            String::from("openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event"),
            String::from("ReentrancyGuardEvent"),
        ),
    ]))
    .with_derives(vec![
        String::from("Clone"),
        String::from("serde::Serialize"),
        String::from("serde::Deserialize"),
        String::from("PartialEq"),
        String::from("Debug"),
    ])
    .with_contract_derives(vec![String::from("Clone"), String::from("Debug")]);

    abigen
        .generate()
        .expect("Fail to generate bindings for Controller")
        .write_to_file("./src/abigen/controller.rs")
        .unwrap();
}

fn generate_erc20_bindings() {
    let abigen = Abigen::new("Erc20", "./artifacts/classes/erc20.contract_class.json")
        .with_types_aliases(HashMap::from([
            (
                String::from("openzeppelin::token::erc20::erc20::ERC20Component::Event"),
                String::from("ERC20ComponentEvent"),
            ),
            (
                String::from("openzeppelin::access::ownable::ownable::OwnableComponent::Event"),
                String::from("OwnableComponentEvent"),
            ),
            (
                String::from("openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event"),
                String::from("UpgradeEvent"),
            ),
            (
                String::from(
                    "openzeppelin::security::reentrancyguard::ReentrancyGuardComponent::Event",
                ),
                String::from("ReentrancyGuardEvent"),
            ),
        ]))
        .with_derives(vec![
            String::from("Clone"),
            String::from("serde::Serialize"),
            String::from("serde::Deserialize"),
            String::from("PartialEq"),
            String::from("Debug"),
        ])
        .with_contract_derives(vec![String::from("Debug")]);

    abigen
        .generate()
        .expect("Fail to generate bindings for ERC20")
        .write_to_file("./src/abigen/erc_20.rs")
        .unwrap();
}
