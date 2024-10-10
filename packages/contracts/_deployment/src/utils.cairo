
use sncast_std::{
    declare, deploy, invoke, call, DeclareResult, DeployResult, InvokeResult, CallResult, get_nonce,
    FeeSettings, EthFeeSettings
};

use starknet::{ContractAddress, ClassHash};

use debug::PrintTrait;


pub fn declare_contract(name: ByteArray) -> ClassHash {
    println!("declaring: {}", name);

    let declare_nonce = get_nonce('pending');
    let declare_result = declare(
        name,
        FeeSettings::Eth(EthFeeSettings { max_fee: Option::None }),
        Option::Some(declare_nonce)
    )
        .expect('declare_contract failed');

    // declare_result.class_hash.print();

    declare_result.class_hash
}

pub fn deploy_contract(name: ByteArray, class_hash: ClassHash, calldata: Array<felt252>) -> ContractAddress {
    println!("deploying: {}", name);

    let deploy_nonce = get_nonce('pending');
    let deploy_result = deploy(
        class_hash,
        calldata,
        Option::None,
        true,
        FeeSettings::Eth(EthFeeSettings { max_fee: Option::None }),
        Option::Some(deploy_nonce)
    )
        .expect('deploy_contract failed');

    deploy_result.contract_address.print();

    deploy_result.contract_address
}
