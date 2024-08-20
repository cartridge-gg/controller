use cainome::rs::Abigen;
use std::collections::HashMap;

fn main() {
    println!("cargo:rerun-if-changed=./compiled");
    generate_controller_bindings();
    generate_erc20_bindings();
}

fn generate_controller_bindings() {
    let abigen = Abigen::new("Controller", "./compiled/controller.contract_class.json")
        .with_types_aliases(HashMap::from([
            (
                String::from("argent::outside_execution::outside_execution::outside_execution_component::Event"),
                String::from("OutsideExecutionEvent"),
            ),
            (
                String::from("controller::Controller::Event"),
                String::from("ControllerEvent"),
            ),
            (
                String::from("controller::external_owners::external_owners::external_owners_component::Event"),
                String::from("ExternalOwnersEvent"),
            ),
            (
                String::from("controller::delegate_account::delegate_account::delegate_account_component::Event"),
                String::from("DelegateAccountEvent"),
            ),
            (
                String::from("controller::session::session::session_component::Event"),
                String::from("SessionEvent"),
            ),
            (
                String::from("controller::multiple_owners::multiple_owners::multiple_owners_component::Event"),
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
                String::from("openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event"),
                String::from("UpgradeEvent"),
            ),
            (
                String::from("openzeppelin::security::reentrancyguard::ReentrancyGuardComponent::Event"),
                String::from("ReentrancyGuardEvent"),
            ),
        ]))
        .with_derives(vec![
            String::from("Clone"),
            String::from("serde::Serialize"),
            String::from("serde::Deserialize"),
            String::from("PartialEq"),
            String::from("Debug"),
        ]);

    abigen
        .generate()
        .expect("Fail to generate bindings for Controller")
        .write_to_file("./src/abigen/controller.rs")
        .unwrap();
}

fn generate_erc20_bindings() {
    let abigen = Abigen::new("Erc20", "./compiled/erc20.contract_class.json")
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
        ]);

    abigen
        .generate()
        .expect("Fail to generate bindings for ERC20")
        .write_to_file("./src/abigen/erc_20.rs")
        .unwrap();
}
