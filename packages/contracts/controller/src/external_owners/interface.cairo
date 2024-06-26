use starknet::ContractAddress;

#[starknet::interface]
trait IExternalOwners<TContractState> {
    fn register_external_owner(
        ref self: TContractState, external_owner_address: ContractAddress
    );

    fn remove_external_owner(
        ref self: TContractState, external_owner_address: ContractAddress
    );

    fn is_registered_external_owner(self: @TContractState, external_owner_address: ContractAddress) -> bool;
}
