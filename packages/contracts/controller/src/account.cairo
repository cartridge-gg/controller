// SPDX-License-Identifier: MIT

use starknet::account::Call;
use starknet::ContractAddress;
use argent::signer::signer_signature::{Signer, SignerSignature, SignerType};

#[starknet::interface]
trait IAssertOwner<TState> {
    fn assert_owner(self: @TState);
}

#[starknet::interface]
trait ICartridgeAccount<TContractState> {
    fn __validate_declare__(ref self: TContractState, class_hash: felt252) -> felt252;
    fn __validate_deploy__(
        ref self: TContractState,
        class_hash: felt252,
        contract_address_salt: felt252,
        owner: CartridgeAccount::Owner,
        guardian: Option<Signer>
    ) -> felt252;
}

#[starknet::contract(account)]
mod CartridgeAccount {
    use openzeppelin::upgrades::UpgradeableComponent::InternalTrait;
    use core::traits::TryInto;
    use core::option::OptionTrait;
    use core::array::SpanTrait;
    use core::to_byte_array::FormatAsByteArray;
    use core::array::ArrayTrait;
    use core::traits::Into;
    use core::result::ResultTrait;
    use hash::HashStateTrait;
    use pedersen::PedersenTrait;
    use starknet::{
        ContractAddress, ClassHash, get_block_timestamp, get_contract_address, VALIDATED,
        replace_class_syscall, get_caller_address, account::Call, SyscallResultTrait, get_tx_info,
        get_execution_info, syscalls::storage_read_syscall,
        storage_access::{
            storage_address_from_base_and_offset, storage_base_address_from_felt252,
            storage_write_syscall
        }
    };

    use argent::account::interface::{
        IAccount, IArgentAccount, IArgentUserAccount, IDeprecatedArgentAccount, Version
    };
    use argent::outside_execution::{
        outside_execution::outside_execution_component, interface::{IOutsideExecutionCallback}
    };
    use argent::recovery::interface::{LegacyEscape, LegacyEscapeType, EscapeStatus};
    use argent::signer::{
        signer_signature::{
            Signer, SignerStorageValue, SignerType, StarknetSigner, StarknetSignature, SignerTrait,
            SignerStorageTrait, SignerSignature, SignerSignatureTrait, starknet_signer_from_pubkey
        }
    };
    use argent::upgrade::{
        upgrade::upgrade_component, interface::{IUpgradableCallback, IUpgradableCallbackOld}
    };
    use argent::utils::{
        asserts::{assert_no_self_call, assert_only_self, assert_only_protocol},
        calls::execute_multicall, serialization::full_deserialize,
        transaction_version::{
            TX_V1, TX_V1_ESTIMATE, TX_V3, TX_V3_ESTIMATE, assert_correct_invoke_version,
            assert_correct_declare_version, assert_correct_deploy_account_version, DA_MODE_L1,
            is_estimate_transaction
        }
    };
    use argent::session::interface::SessionToken;

    use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;

    use controller::account::{ICartridgeAccount, IAssertOwner};
    use controller::external_owners::external_owners::{
        external_owners_component,
        external_owners_component::InternalImpl as ExternalOwnersInternalImpl
    };
    use controller::delegate_account::delegate_account::delegate_account_component;
    use controller::introspection::src5::src5_component;
    use controller::session::{
        session::session_component::InternalImpl, session::session_component,
        interface::ISessionCallback
    };
    use controller::multiple_owners::{
        multiple_owners::{multiple_owners_component}, interface::IMultipleOwners
    };

    const TRANSACTION_VERSION: felt252 = 1;
    // 2**128 + TRANSACTION_VERSION
    const QUERY_VERSION: felt252 = 0x100000000000000000000000000000001;

    component!(path: session_component, storage: session, event: SessionEvent);
    #[abi(embed_v0)]
    impl SessionImpl = session_component::SessionComponent<ContractState>;

    component!(
        path: multiple_owners_component, storage: multiple_owners, event: MultipleOwnersEvent
    );
    #[abi(embed_v0)]
    impl MultipleOwnersImpl =
        multiple_owners_component::MultipleOwnersImpl<ContractState>;

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

    // Reentrancy guard
    component!(
        path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyGuardEvent
    );
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        multiple_owners: multiple_owners_component::Storage,
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
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
        TransactionExecuted: TransactionExecuted,
        #[flat]
        MultipleOwnersEvent: multiple_owners_component::Event,
        #[flat]
        ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
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

    #[derive(Drop, Copy, Serde)]
    enum Owner {
        Signer: Signer,
        Account: ContractAddress,
    }

    /// @notice Emitted when the account executes a transaction
    /// @param hash The transaction hash
    /// @param response The data returned by the methods called
    #[derive(Drop, starknet::Event)]
    struct TransactionExecuted {
        #[key]
        hash: felt252,
        response: Span<Span<felt252>>
    }

    mod Errors {
        const INVALID_CALLER: felt252 = 'Account: invalid caller';
        const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        const INVALID_TX_VERSION: felt252 = 'Account: invalid tx version';
        const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: Owner, guardian: Option<Signer>) {
        match owner {
            Owner::Signer(signer) => {
                self.multiple_owners.owners.write(signer.into_guid(), true);
            },
            Owner::Account(account) => { self.external_owners._register_external_owner(account); },
        }
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
            self.reentrancy_guard.start();
            let exec_info = get_execution_info().unbox();
            let tx_info = exec_info.tx_info.unbox();
            assert_only_protocol(exec_info.caller_address);
            assert_correct_invoke_version(tx_info.version);
            let signature = tx_info.signature;
            if self.session.is_session(signature) {
                let session_timestamp = *signature[1];
                // can call unwrap safely as the session has already been deserialized
                let session_timestamp_u64 = session_timestamp.try_into().unwrap();
                assert(
                    session_timestamp_u64 >= exec_info.block_info.unbox().block_timestamp,
                    'session/expired'
                );
            }

            let retdata = execute_multicall(calls.span());

            self
                .emit(
                    TransactionExecuted { hash: tx_info.transaction_hash, response: retdata.span() }
                );
            self.reentrancy_guard.end();
            retdata
        }

        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self
                .is_valid_span_signature(
                    hash, self.parse_signature_array(signature.span()).span()
                ) {
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
            assert_correct_declare_version(tx_info.version);
            assert(tx_info.paymaster_data.is_empty(), 'unsupported-paymaster');

            if self.session.is_session(tx_info.signature) {
                let call = Call {
                    to: get_contract_address(),
                    selector: selector!("__declare_transaction__"),
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
            owner: Owner,
            guardian: Option<Signer>,
        ) -> felt252 {
            let tx_info = get_tx_info().unbox();
            assert_correct_deploy_account_version(tx_info.version);
            assert(tx_info.paymaster_data.is_empty(), 'unsupported-paymaster');
            self
                .assert_valid_span_signature(
                    tx_info.transaction_hash, self.parse_signature_array(tx_info.signature)
                );
            starknet::VALIDATED
        }
    }

    impl SessionCallbackImpl of ISessionCallback<ContractState> {
        fn parse_authorization(
            self: @ContractState, authorization_signature: Span<felt252>
        ) -> Array<SignerSignature> {
            self.parse_signature_array(authorization_signature)
        }

        fn is_valid_authorizer(self: @ContractState, guid_or_address: felt252) -> bool {
            if self.multiple_owners.is_owner(guid_or_address) {
                return true;
            }

            let address: Option<ContractAddress> = guid_or_address.try_into();
            match address {
                Option::Some(address) => self.is_external_owner(address),
                Option::None => false,
            }
        }

        fn verify_authorization(
            self: @ContractState,
            session_hash: felt252,
            authorization_signature: Span<SignerSignature>
        ) {
            assert(
                self.is_valid_span_signature(session_hash, authorization_signature),
                'session/invalid-account-sig'
            );
        }
    }

    impl IAssertOwnerImpl of IAssertOwner<ContractState> {
        fn assert_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert(
                caller == get_contract_address() || self.is_external_owner(caller),
                'caller-not-owner'
            );
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
            let retdata = execute_multicall(calls);
            self
                .emit(
                    TransactionExecuted { hash: outside_execution_hash, response: retdata.span() }
                );
            retdata
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.assert_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    //
    // Internal
    //

    #[generate_trait]
    impl ContractInternalImpl of ContractInternalTrait {
        #[must_use]
        fn is_valid_span_signature(
            self: @ContractState, hash: felt252, signer_signatures: Span<SignerSignature>
        ) -> bool {
            assert(signer_signatures.len() <= 2, 'invalid-signature-length');
            self.is_valid_owner_signature(hash, *signer_signatures.at(0))
        }

        #[must_use]
        fn is_valid_owner_signature(
            self: @ContractState, hash: felt252, signer_signature: SignerSignature
        ) -> bool {
            let signer = signer_signature.signer().storage_value();
            if !self.is_owner(signer.into_guid()) {
                return false;
            }
            return signer_signature.is_valid_signature(hash);
        }

        #[inline(always)]
        fn parse_signature_array(
            self: @ContractState, mut signatures: Span<felt252>
        ) -> Array<SignerSignature> {
            // manual inlining instead of calling full_deserialize for performance
            let deserialized: Array<SignerSignature> = Serde::deserialize(ref signatures)
                .expect('invalid-signature-format');
            assert(signatures.is_empty(), 'invalid-signature-length');
            deserialized
        }

        fn assert_valid_span_signature(
            self: @ContractState, hash: felt252, signer_signatures: Array<SignerSignature>
        ) {
            assert(signer_signatures.len() <= 2, 'invalid-signature-length');
            assert(
                self.is_valid_owner_signature(hash, *signer_signatures.at(0)), 'invalid-owner-sig'
            );
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
}
