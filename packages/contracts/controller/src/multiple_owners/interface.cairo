use starknet::ContractAddress;
use argent::signer::{
    signer_signature::{
        Signer, SignerStorageValue, SignerType, StarknetSigner, StarknetSignature, SignerTrait,
        SignerStorageTrait, SignerSignature, SignerSignatureTrait, starknet_signer_from_pubkey
    }
};

#[starknet::interface]
trait IMultipleOwners<TContractState> {
    fn add_owner(ref self: TContractState, owner: Signer, signature: SignerSignature);
    fn swap_owner(
        ref self: TContractState, old_owner: Signer, new_owner: Signer, signature: SignerSignature
    );
    fn remove_owner(ref self: TContractState, owner: Signer);
    fn is_owner(self: @TContractState, owner_guid: felt252) -> bool;
    fn assert_valid_new_owner_signature(self: @TContractState, signer_signature: SignerSignature);
}

#[starknet::interface]
trait IMultipleOwnersInternal<TContractState> {
    fn initialize(ref self: TContractState, owner: SignerStorageValue);
    fn add_owner_internal(ref self: TContractState, owner: SignerStorageValue);
    fn swap_owner_internal(
        ref self: TContractState, old_owner: SignerStorageValue, new_owner: SignerStorageValue
    );
    fn remove_owner_internal(ref self: TContractState, owner: SignerStorageValue);
    fn assert_valid_new_owner_signature_internal(
        self: @TContractState,
        signer_signature: SignerSignature,
        chain_id: felt252,
        contract_address: ContractAddress
    );
}
