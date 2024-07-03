// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts for Cairo v0.7.0 (account/account.cairo)

use starknet::testing;
use starknet::secp256r1::Secp256r1Point;
use starknet::account::Call;
use controller_auth::signer::{Signer, SignerStorageValue, SignerType, SignerSignature,};
use starknet::ContractAddress;


#[starknet::interface]
trait IAccount<TContractState> {
    fn __validate__(ref self: TContractState, calls: Array<Call>) -> felt252;
    fn __execute__(ref self: TContractState, calls: Array<Call>) -> Array<Span<felt252>>;
    fn is_valid_signature(
        self: @TContractState, hash: felt252, signature: Array<felt252>
    ) -> felt252;
}

#[starknet::interface]
trait IUserAccount<TContractState> {
    fn change_owner(ref self: TContractState, signer_signature: SignerSignature);
    fn get_owner(self: @TContractState) -> felt252;
    fn get_owner_type(self: @TContractState) -> SignerType;
}

#[starknet::interface]
trait ICartridgeAccount<TContractState> {
    fn __validate_declare__(ref self: TContractState, class_hash: felt252) -> felt252;
    fn __validate_deploy__(
        ref self: TContractState, 
        class_hash: felt252, 
        contract_address_salt: felt252, 
        owner: Signer, 
        guardian: Option<Signer>
    ) -> felt252;
}


#[starknet::interface]
trait IAllowedCallerCallback<TState> {
    fn is_caller_allowed(self: @TState, caller_address: ContractAddress) -> bool;
}

#[starknet::contract(account)]
mod CartridgeAccount {
    use core::traits::TryInto;
    use core::option::OptionTrait;
    use core::array::SpanTrait;
    use core::to_byte_array::FormatAsByteArray;
    use core::array::ArrayTrait;
    use core::traits::Into;
    use core::result::ResultTrait;
    use ecdsa::check_ecdsa_signature;
    use openzeppelin::account::interface;
    use starknet::{
        ContractAddress, ClassHash, get_block_timestamp, get_contract_address, VALIDATED,
        replace_class_syscall, account::Call, SyscallResultTrait, get_tx_info, get_execution_info,
        get_caller_address, syscalls::storage_read_syscall,
        storage_access::{
            storage_address_from_base_and_offset, storage_base_address_from_felt252,
            storage_write_syscall
        }
    };
    use controller_auth::{webauthn::verify};
    use controller::session::{
        lib::session_component::{InternalImpl, InternalTrait}, lib::session_component,
        interface::{ISessionCallback, SessionToken}
    };
    use serde::Serde;
    use controller::signature_type::{SignatureType, SignatureTypeImpl};
    use controller_auth::signer::{
        Signer, WebauthnSigner, StarknetSigner, SignerTraitImpl, SignerStorageValue, SignerType,
        SignerSignature, StarknetSignature, SignerSignatureImpl, SignerStorageValueImpl
    };
    use hash::HashStateTrait;
    use pedersen::PedersenTrait;
    use controller::account::{IAccount, IUserAccount, ICartridgeAccount, IAllowedCallerCallback};
    use controller::outside_execution::{
        outside_execution::outside_execution_component, interface::IOutsideExecutionCallback
    };
    use controller::external_owners::external_owners::external_owners_component;
    use controller::delegate_account::delegate_account::delegate_account_component;
    use controller::src5::src5_component;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;

    const TRANSACTION_VERSION: felt252 = 1;
    // 2**128 + TRANSACTION_VERSION
    const QUERY_VERSION: felt252 = 0x100000000000000000000000000000001;

    component!(path: session_component, storage: session, event: SessionEvent);
    #[abi(embed_v0)]
    impl SessionImpl = session_component::SessionComponent<ContractState>;

    // Execute from outside
    component!(
        path: outside_execution_component,
        storage: execute_from_outside,
        event: ExecuteFromOutsideEvents
    );
    #[abi(embed_v0)]
    impl ExecuteFromOutside =
        outside_execution_component::OutsideExecutionImpl<ContractState>;

    // External owners
    component!(
        path: external_owners_component, storage: external_owners, event: ExternalOwnersEvent
    );
    #[abi(embed_v0)]
    impl ExternalOwners =
        external_owners_component::ExternalOwnersImpl<ContractState>;
 
    // Delegate Account
    component!(
        path: delegate_account_component, storage: delegate_account, event: DelegateAccountEvents
    );
    #[abi(embed_v0)]
    impl DelegateAccount =
        delegate_account_component::DelegateAccountImpl<ContractState>;

    // SRC5
    component!(path: src5_component, storage: src5, event: SRC5Events);
    #[abi(embed_v0)]
    impl SRC5 = src5_component::SRC5Impl<ContractState>;

    // Upgradeable
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

   

    #[storage]
    struct Storage {
        _owner: felt252,
        _owner_non_stark: LegacyMap<felt252, felt252>,
        #[substorage(v0)]
        session: session_component::Storage,
        #[substorage(v0)]
        external_owners: external_owners_component::Storage,
        #[substorage(v0)]
        execute_from_outside: outside_execution_component::Storage,
        #[substorage(v0)]
        delegate_account: delegate_account_component::Storage,
        #[substorage(v0)]
        src5: src5_component::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnerChanged: OwnerChanged,
        OwnerChangedGuid: OwnerChangedGuid,
        SignerLinked: SignerLinked,
        #[flat]
        SessionEvent: session_component::Event,
        #[flat]
        ExternalOwnersEvent: external_owners_component::Event,
        #[flat]
        ExecuteFromOutsideEvents: outside_execution_component::Event,
        #[flat]
        DelegateAccountEvents: delegate_account_component::Event,
        #[flat]
        SRC5Events: src5_component::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event
    }

    #[derive(Drop, starknet::Event)]
    struct OwnerChanged {
        new_owner: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct OwnerChangedGuid {
        new_owner_guid: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct SignerLinked {
        #[key]
        signer_guid: felt252,
        signer: Signer,
    }

    mod Errors {
        const INVALID_CALLER: felt252 = 'Account: invalid caller';
        const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        const INVALID_TX_VERSION: felt252 = 'Account: invalid tx version';
        const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: Signer, guardian: Option<Signer>) {
        self.init_owner(owner.storage_value());
    }

    //
    // External
    //

    #[abi(embed_v0)]
    impl AccountImpl of IAccount<ContractState> {
        fn __validate__(ref self: ContractState, mut calls: Array<Call>) -> felt252 {
            let exec_info = get_execution_info().unbox();
            let tx_info = get_tx_info().unbox();

            assert(tx_info.paymaster_data.is_empty(), 'unsupported-paymaster');

            if self.session.is_session(tx_info.signature) {
                self
                    .session
                    .validate_session_serialized(
                        tx_info.signature, calls.span(), tx_info.transaction_hash
                    );
            } else {
                self
                    .assert_valid_calls_and_signature(
                        calls.span(),
                        tx_info.transaction_hash,
                        tx_info.signature,
                        is_from_outside: false,
                        account_address: exec_info.contract_address,
                    );
            }
            starknet::VALIDATED
        }

        fn __execute__(ref self: ContractState, mut calls: Array<Call>) -> Array<Span<felt252>> {
            // Avoid calls from other contracts
            // https://github.com/OpenZeppelin/cairo-contracts/issues/344
            let sender = get_caller_address();
            assert(sender.is_zero(), Errors::INVALID_CALLER);

            let tx_info = get_tx_info().unbox();
            let version = tx_info.version;
            if version != TRANSACTION_VERSION {
                assert(version == QUERY_VERSION, Errors::INVALID_TX_VERSION);
            }

            _execute_calls(calls.span())
        }

        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self.is_valid_span_signature(hash, self.parse_signature_array(signature.span())) {
                starknet::VALIDATED
            } else {
                0
            }
        }
    }

    #[abi(embed_v0)]
    impl CartridgeAccountImpl of ICartridgeAccount<ContractState> {
        fn __validate_declare__(ref self: ContractState, class_hash: felt252) -> felt252 {
            let tx_info = get_tx_info().unbox();
            assert(tx_info.paymaster_data.is_empty(), 'unsupported-paymaster');
            if self.session.is_session(tx_info.signature) {
                let call = Call {
                    to: get_contract_address(),
                    selector: controller_auth::DECLARE_SELECTOR,
                    calldata: array![class_hash,].span()
                };
                self
                    .session
                    .validate_session_serialized(
                        tx_info.signature, array![call].span(), tx_info.transaction_hash
                    );
            } else {
                self
                    .assert_valid_span_signature(
                        tx_info.transaction_hash, self.parse_signature_array(tx_info.signature)
                    );
            }
            starknet::VALIDATED
        }
    
        fn __validate_deploy__(
            ref self: ContractState,
            class_hash: felt252,
            contract_address_salt: felt252,
            owner: Signer, 
            guardian: Option<Signer>,
        ) -> felt252 {
            let tx_info = get_tx_info().unbox();
            assert(tx_info.paymaster_data.is_empty(), 'unsupported-paymaster');
            self
                .assert_valid_span_signature(
                    tx_info.transaction_hash, self.parse_signature_array(tx_info.signature)
                );
            starknet::VALIDATED
        }
    }

    #[abi(embed_v0)]
    impl UserAccountImpl of IUserAccount<ContractState> {
        fn change_owner(ref self: ContractState, signer_signature: SignerSignature) {
            assert(self.is_caller_allowed(get_caller_address()), 'caller-not-owner');

            let new_owner = signer_signature.signer();

            self.assert_valid_new_owner_signature(signer_signature);

            let new_owner_storage_value = new_owner.storage_value();
            self.write_owner(new_owner_storage_value);

            if let Option::Some(new_owner_pubkey) = new_owner_storage_value
                .starknet_pubkey_or_none() {
                self.emit(OwnerChanged { new_owner: new_owner_pubkey });
            };
            let new_owner_guid = new_owner_storage_value.into_guid();
            self.emit(OwnerChangedGuid { new_owner_guid });
            self.emit(SignerLinked { signer_guid: new_owner_guid, signer: new_owner });
        }

        fn get_owner(self: @ContractState) -> felt252 {
            let stored_value = self._owner.read();
            assert(stored_value != 0, 'only_guid');
            stored_value
        }
        fn get_owner_type(self: @ContractState) -> SignerType {
            if self._owner.read() != 0 {
                SignerType::Starknet
            } else {
                SignerType::Webauthn
            }
        }
    }
    
    impl SessionCallbackImpl of ISessionCallback<ContractState> {
        fn session_callback(
            self: @ContractState, session_hash: felt252, authorization_signature: Span<felt252>
        ) -> bool {
            self
                .is_valid_span_signature(
                    session_hash, self.parse_signature_array(authorization_signature)
                )
        }
    }
    impl IAllowedCallerCallbackImpl of IAllowedCallerCallback<ContractState> {
        fn is_caller_allowed(self: @ContractState, caller_address: ContractAddress) -> bool {
            caller_address == get_contract_address()
                || self.is_registered_external_owner(caller_address)
        }
    }

    impl OutsideExecutionCallbackImpl of IOutsideExecutionCallback<ContractState> {
        #[inline(always)]
        fn execute_from_outside_callback(
            ref self: ContractState,
            calls: Span<Call>,
            outside_execution_hash: felt252,
            signature: Span<felt252>,
        ) -> Array<Span<felt252>> {
            if self.session.is_session(signature) {
                self.session.validate_session_serialized(signature, calls, outside_execution_hash);
            } else {
                self
                    .assert_valid_calls_and_signature(
                        calls,
                        outside_execution_hash,
                        signature,
                        is_from_outside: true,
                        account_address: get_contract_address()
                    );
            }
            let retdata = _execute_calls(calls);
            retdata
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            assert(self.is_caller_allowed(get_caller_address()), 'caller-not-owner');
            self.upgradeable._upgrade(new_class_hash);
        }
    }

    //
    // Internal
    //

    #[generate_trait]
    impl ContractInternalImpl of ContractInternalTrait {
        #[inline(always)]
        fn init_owner(ref self: ContractState, owner: SignerStorageValue) {
            match owner.signer_type {
                SignerType::Starknet => self._owner.write(owner.stored_value),
                _ => self._owner_non_stark.write(owner.signer_type.into(), owner.stored_value),
            }
        }
        fn write_owner(ref self: ContractState, owner: SignerStorageValue) {
            // clear storage
            let old_owner = self.read_owner();
            match old_owner.signer_type {
                SignerType::Starknet => self._owner.write(0),
                SignerType::Unimplemented => panic!("Unimplemented signer type"),
                _ => self._owner_non_stark.write(old_owner.signer_type.into(), 0),
            }
            // write storage
            match owner.signer_type {
                SignerType::Starknet => self._owner.write(owner.stored_value),
                SignerType::Unimplemented => panic!("Unimplemented signer type"),
                _ => self._owner_non_stark.write(owner.signer_type.into(), owner.stored_value),
            }
        }
        fn read_owner(self: @ContractState) -> SignerStorageValue {
            let mut preferred_order = owner_ordered_types();
            loop {
                let signer_type = *preferred_order.pop_front().expect('owner-not-found');
                let stored_value = match signer_type {
                    SignerType::Starknet => self._owner.read(),
                    SignerType::Unimplemented => panic!("Unimplemented signer type"),
                    _ => self._owner_non_stark.read(signer_type.into()),
                };
                if stored_value != 0 {
                    break SignerStorageValue {
                        stored_value: stored_value.try_into().unwrap(), signer_type
                    };
                }
            }
        }

        #[must_use]
        fn is_valid_span_signature(
            self: @ContractState, hash: felt252, signer_signatures: Array<SignerSignature>
        ) -> bool {
            assert(signer_signatures.len() <= 2, 'invalid-signature-length');
            self.is_valid_owner_signature(hash, *signer_signatures.at(0))
        }
        #[must_use]
        fn is_valid_owner_signature(
            self: @ContractState, hash: felt252, signer_signature: SignerSignature
        ) -> bool {
            let signer = signer_signature.signer().storage_value();
            if !self.is_valid_owner(signer) {
                return false;
            }
            return signer_signature.is_valid_signature(hash);
        }
        fn assert_valid_new_owner_signature(
            self: @ContractState, signer_signature: SignerSignature
        ) {
            let chain_id = get_tx_info().unbox().chain_id;
            let owner_guid = self.read_owner().into_guid();
            // We now need to hash message_hash with the size of the array: (change_owner selector,
            // chain id, contract address, old_owner_guid)
            // 
            // https://github.com/starkware-libs/cairo-lang/blob/b614d1867c64f3fb2cf4a4879348cfcf87c3a5a7/src/starkware/cairo/common/hash_state.py#L6
            let message_hash = PedersenTrait::new(0)
                .update(selector!("change_owner"))
                .update(chain_id)
                .update(get_contract_address().into())
                .update(owner_guid)
                .update(4)
                .finalize();

            let is_valid = signer_signature.is_valid_signature(message_hash);
            assert(is_valid, 'invalid-owner-sig');
        }
        #[inline(always)]
        fn parse_signature_array(
            self: @ContractState, mut signatures: Span<felt252>
        ) -> Array<SignerSignature> {
            // Check if it's a legacy signature array (there's no support for guardian backup)
            if signatures.len() != 2 && signatures.len() != 4 {
                // manual inlining instead of calling full_deserialize for performance
                let deserialized: Array<SignerSignature> = Serde::deserialize(ref signatures)
                    .expect('invalid-signature-format');
                assert(signatures.is_empty(), 'invalid-signature-length');
                return deserialized;
            }

            let owner_signature = SignerSignature::Starknet(
                (
                    StarknetSigner { pubkey: self._owner.read().try_into().expect('zero-pubkey') },
                    StarknetSignature {
                        r: *signatures.pop_front().unwrap(), s: *signatures.pop_front().unwrap()
                    }
                )
            );
            if signatures.is_empty() {
                return array![owner_signature];
            }
            return array![owner_signature, owner_signature];
        }
        fn assert_valid_span_signature(
            self: @ContractState, hash: felt252, signer_signatures: Array<SignerSignature>
        ) {
            assert(signer_signatures.len() <= 2, 'invalid-signature-length');
            assert(
                self.is_valid_owner_signature(hash, *signer_signatures.at(0)), 'invalid-owner-sig'
            );
        }
        #[inline(always)]
        fn is_valid_owner(self: @ContractState, owner: SignerStorageValue) -> bool {
            match owner.signer_type {
                SignerType::Starknet => self._owner.read() == owner.stored_value,
                SignerType::Unimplemented => panic!("Unimplemented signer type"),
                _ => self._owner_non_stark.read(owner.signer_type.into()) == owner.stored_value,
            }
        }
        fn assert_valid_calls_and_signature(
            ref self: ContractState,
            calls: Span<Call>,
            execution_hash: felt252,
            mut signatures: Span<felt252>,
            is_from_outside: bool,
            account_address: ContractAddress,
        ) {
            let signer_signatures: Array<SignerSignature> = self.parse_signature_array(signatures);
            self.assert_valid_span_signature(execution_hash, signer_signatures);
        }
    }

    fn _execute_calls(mut calls: Span<Call>) -> Array<Span<felt252>> {
        let mut res = ArrayTrait::new();
        loop {
            match calls.pop_front() {
                Option::Some(call) => {
                    let _res = _execute_single_call(call);
                    res.append(_res);
                },
                Option::None(_) => { break (); },
            };
        };
        res
    }

    fn _execute_single_call(call: @Call) -> Span<felt252> {
        let Call { to, selector, calldata } = call;
        starknet::call_contract_syscall(*to, *selector, *calldata).unwrap()
    }

    fn owner_ordered_types() -> Span<SignerType> {
        array![SignerType::Starknet, SignerType::Webauthn, SignerType::Secp256k1].span()
    }
}
