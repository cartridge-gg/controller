use starknet::ContractAddress;

const SRC5_EXTERNAL_OWNERS_INTERFACE_ID: felt252 =
    0x24c5ac715771a02a2069470c06dfd8e80af7cd6b2d2e47698ccac4a4a4aa437;

#[starknet::interface]
trait IExternalOwners<TContractState> {
    fn register_external_owner(ref self: TContractState, external_owner_address: ContractAddress);
    fn remove_external_owner(ref self: TContractState, external_owner_address: ContractAddress);
    fn is_external_owner(self: @TContractState, external_owner_address: ContractAddress) -> bool;
}
