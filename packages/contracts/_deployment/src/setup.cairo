
use sncast_std::{
    declare, deploy, invoke, call, DeclareResult, DeployResult, InvokeResult, CallResult, get_nonce,
    FeeSettings, EthFeeSettings
};

use starknet::{ContractAddress, ClassHash};

pub const DEV_ADMIN: felt252 = 0x41b6dab3967eaaee4cfecdc950079aee353afd96bcf0628bf84fc64a43c3021;
pub const DEV_EXECUTOR: felt252 = 0x657e5f424dc6dee0c5a305361ea21e93781fea133d83efa410b771b7f92b;

use super::utils::{declare_contract, deploy_contract};

pub fn main() {

    let registry_class_hash = declare_contract("Registry");
    let resolver_class_hash = declare_contract("ControllerResolverDelegation");

    let registry_calldata: Array<felt252> = array![DEV_ADMIN, 0x1, DEV_EXECUTOR];
    let registry_address = deploy_contract("- Registry -", registry_class_hash, registry_calldata);
     
    let resolver_calldata: Array<felt252> = array![DEV_ADMIN, registry_address.into()];
    let _resolver_address = deploy_contract("- Resolver -",resolver_class_hash, resolver_calldata);

}

