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
    fn remove_owner(ref self: TContractState, owner: Signer);
    fn is_owner(self: @TContractState, owner_guid: felt252) -> bool;
    fn assert_valid_owner_signature(self: @TContractState, signer_signature: SignerSignature);
}
