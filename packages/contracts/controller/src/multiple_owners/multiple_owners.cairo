#[starknet::component]
mod multiple_owners_component {
    use controller::multiple_owners::interface::{IMultipleOwnersInternal, IMultipleOwners};
    use argent::signer::{
        signer_signature::{
            Signer, SignerStorageValue, SignerType, StarknetSigner, StarknetSignature, SignerTrait,
            SignerStorageTrait, SignerSignature, SignerSignatureTrait, starknet_signer_from_pubkey
        }
    };
    use controller::account::IAllowedCallerCallback;
    use starknet::info::{get_caller_address, get_tx_info};
    use pedersen::PedersenTrait;
    use hash::HashStateTrait;
    use starknet::{ContractAddress, get_contract_address};

    #[storage]
    struct Storage {
        _owners: LegacyMap<felt252, usize>,
        _owners_ordered: LegacyMap<usize, felt252>,
        _owners_count: usize,
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
        +IAllowedCallerCallback<TContractState>,
        +Drop<TContractState>
    > of IMultipleOwners<ComponentState<TContractState>> {
        fn add_owner(
            ref self: ComponentState<TContractState>, owner: Signer, signature: SignerSignature
        ) {
            let contract = self.get_contract();
            contract.is_caller_allowed(get_caller_address());

            self.assert_valid_new_owner_signature(signature);
            self.add_owner_internal(owner.storage_value());
            self.emit(OwnerAdded { owner });
        }

        fn swap_owner(
            ref self: ComponentState<TContractState>,
            old_owner: Signer,
            new_owner: Signer,
            signature: SignerSignature
        ) {
            let contract = self.get_contract();
            contract.is_caller_allowed(get_caller_address());

            self.assert_valid_new_owner_signature(signature);
            self.swap_owner_internal(old_owner.storage_value(), new_owner.storage_value());
            self.emit(OwnerAdded { owner: new_owner });
            self.emit(OwnerRemoved { owner: old_owner });
        }

        fn remove_owner(ref self: ComponentState<TContractState>, owner: Signer) {
            let contract = self.get_contract();
            contract.is_caller_allowed(get_caller_address());

            self.remove_owner_internal(owner.storage_value());
            self.emit(OwnerRemoved { owner });
        }

        fn is_valid_owner(self: @ComponentState<TContractState>, owner_guid: felt252) -> bool {
            self._owners.read(owner_guid) != 0
        }

        fn assert_valid_new_owner_signature(
            self: @ComponentState<TContractState>, signer_signature: SignerSignature,
        ) {
            self
                .assert_valid_new_owner_signature_internal(
                    signer_signature, get_tx_info().unbox().chain_id, get_contract_address()
                );
        }
    }

    #[embeddable_as(MultipleOwnersInternalImpl)]
    impl ImplMultipleOwnersInternal<
        TContractState,
        +HasComponent<TContractState>,
        +IAllowedCallerCallback<TContractState>,
        +Drop<TContractState>
    > of IMultipleOwnersInternal<ComponentState<TContractState>> {
        fn initialize(ref self: ComponentState<TContractState>, owner: SignerStorageValue) {
            let guid = owner.into_guid();
            self._owners.write(guid, 1);
            self._owners_ordered.write(1, guid);
            self._owners_count.write(1);
        }

        fn add_owner_internal(ref self: ComponentState<TContractState>, owner: SignerStorageValue) {
            let guid = owner.into_guid();
            let count = self._owners_count.read();
            assert(self._owners.read(guid) == 0, 'owner-already-exists');
            self._owners.write(guid, count + 1);
            self._owners_ordered.write(count + 1, guid);
            self._owners_count.write(count + 1);
        }

        fn swap_owner_internal(
            ref self: ComponentState<TContractState>,
            old_owner: SignerStorageValue,
            new_owner: SignerStorageValue
        ) {
            let old_guid = old_owner.into_guid();
            let new_guid = new_owner.into_guid();
            let old_pos = self._owners.read(old_guid);
            assert(old_pos != 0, 'old-owner-not-exists');
            assert(self._owners.read(new_guid) == 0, 'new-owner-already-exists');
            self._owners.write(old_guid, 0);
            self._owners.write(new_guid, old_pos);
            self._owners_ordered.write(old_pos, new_guid);
        }

        fn remove_owner_internal(
            ref self: ComponentState<TContractState>, owner: SignerStorageValue
        ) {
            let guid = owner.into_guid();
            let count = self._owners_count.read();
            assert(count > 1, 'owners-count-low');
            let old_pos = self._owners.read(guid);
            assert(old_pos != 0, 'owner-not-exists');
            let last_guid = self._owners_ordered.read(count);
            self._owners.write(guid, 0);
            self._owners.write(last_guid, old_pos);
            self._owners_ordered.write(old_pos, last_guid);
            self._owners_count.write(count - 1);
        }
        fn assert_valid_new_owner_signature_internal(
            self: @ComponentState<TContractState>,
            signer_signature: SignerSignature,
            chain_id: felt252,
            contract_address: ContractAddress
        ) {
            // We now need to hash message_hash with the size of the array: (change_owner selector,
            // chain id, contract address, old_owner_guid)
            // https://github.com/starkware-libs/cairo-lang/blob/b614d1867c64f3fb2cf4a4879348cfcf87c3a5a7/src/starkware/cairo/common/hash_state.py#L6
            let message_hash = PedersenTrait::new(0)
                .update(selector!("change_owner"))
                .update(chain_id)
                .update(contract_address.into())
                .update(3)
                .finalize();

            let is_valid = signer_signature.is_valid_signature(message_hash);
            assert(is_valid, 'invalid-owner-sig');
        }
    }
}
