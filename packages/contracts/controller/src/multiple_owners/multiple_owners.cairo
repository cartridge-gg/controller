#[starknet::component]
mod multiple_owners_component {
    use core::poseidon::poseidon_hash_span;
    use hash::HashStateTrait;
    use starknet::info::{get_caller_address, get_tx_info};
    use starknet::{ContractAddress, get_contract_address};

    use argent::signer::{
        signer_signature::{
            Signer, SignerStorageValue, SignerType, StarknetSigner, StarknetSignature, SignerTrait,
            SignerStorageTrait, SignerSignature, SignerSignatureTrait, starknet_signer_from_pubkey
        }
    };

    use controller::multiple_owners::interface::IMultipleOwners;
    use controller::account::IAssertOwner;

    #[storage]
    struct Storage {
        owners: LegacyMap<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnerAdded: OwnerAdded,
        OwnerRemoved: OwnerRemoved,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnerAdded {
        owner: Signer,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnerRemoved {
        owner: Signer,
    }

    #[embeddable_as(MultipleOwnersImpl)]
    impl ImplMultipleOwners<
        TContractState,
        +HasComponent<TContractState>,
        +IAssertOwner<TContractState>,
        +Drop<TContractState>
    > of IMultipleOwners<ComponentState<TContractState>> {
        fn add_owner(
            ref self: ComponentState<TContractState>, owner: Signer, signature: SignerSignature
        ) {
            self.get_contract().assert_owner();
            self.assert_valid_owner_signature(signature);

            self.owners.write(owner.into_guid(), true);
            self.emit(OwnerAdded { owner });
        }

        fn remove_owner(ref self: ComponentState<TContractState>, owner: Signer) {
            self.get_contract().assert_owner();

            self.owners.write(owner.into_guid(), false);
            self.emit(OwnerRemoved { owner });
        }

        fn is_owner(self: @ComponentState<TContractState>, owner_guid: felt252) -> bool {
            self.owners.read(owner_guid)
        }

        fn assert_valid_owner_signature(
            self: @ComponentState<TContractState>, signer_signature: SignerSignature,
        ) {
            // We now need to hash message_hash with the size of the array: (add_owner selector,
            // chain id, contract address)
            // https://github.com/starkware-libs/cairo-lang/blob/b614d1867c64f3fb2cf4a4879348cfcf87c3a5a7/src/starkware/cairo/common/hash_state.py#L6
            let message_hash = poseidon_hash_span(array![
                selector!("add_owner"),
                get_tx_info().unbox().chain_id,
                get_contract_address().into()
            ].span());
                
            assert(signer_signature.is_valid_signature(message_hash), 'invalid-owner-sig');
        }
    }
}
