#[allow(warnings)]
#[allow(non_snake_case)]
pub mod controller {
    use cainome::rs::abigen;

    abigen!(
        Controller,
        "packages/account_sdk/compiled/controller.contract_class.json",
        type_aliases {
            argent::outside_execution::outside_execution::outside_execution_component::Event as OutsideExecutionEvent;
            controller::Controller::Event as ControllerEvent;
            controller::external_owners::external_owners::external_owners_component::Event as ExternalOwnersEvent;
            controller::delegate_account::delegate_account::delegate_account_component::Event as DelegateAccountEvent;
            controller::session::session::session_component::Event as SessionEvent;
            controller::multiple_owners::multiple_owners::multiple_owners_component::Event as MultipleOwnersEvent;
            controller::introspection::src5::src5_component::Event as Src5ComponentEvent;
            openzeppelin::token::erc20::erc20::ERC20Component::Event as ERC20ComponentEvent;
            openzeppelin::access::ownable::ownable::OwnableComponent::Event as OwnableComponentEvent;
            openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event as UpgradeEvent;
            openzeppelin::security::reentrancyguard::ReentrancyGuardComponent::Event as ReentrancyGuardEvent;
        },
        derives(Clone, serde::Serialize, serde::Deserialize, PartialEq, Debug)
    );
}

#[allow(warnings)]
#[allow(non_snake_case)]
#[cfg(test)]
pub mod erc_20 {
    use cainome::rs::abigen;

    abigen!(
        Erc20,
        "packages/account_sdk/compiled/erc20.contract_class.json",
        type_aliases {
            openzeppelin::token::erc20::erc20::ERC20Component::Event as ERC20ComponentEvent;
            openzeppelin::access::ownable::ownable::OwnableComponent::Event as OwnableComponentEvent;
            openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event as UpgradeEvent;
            openzeppelin::security::reentrancyguard::ReentrancyGuardComponent::Event as ReentrancyGuardEvent;
        },
        derives(Clone, serde::Serialize, serde::Deserialize, PartialEq, Debug)
    );
}
