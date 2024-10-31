use starknet::account::Call;
use core::array::ArrayTrait;
use alexandria_merkle_tree::merkle_tree::{
    Hasher, MerkleTree, poseidon::PoseidonHasherImpl, MerkleTreeTrait
};
use argent::session::{session_hash::MerkleLeafHashPolicy, interface::Policy};

// Based on
// https://github.com/argentlabs/starknet-plugin-account/blob/3c14770c3f7734ef208536d91bbd76af56dc2043/contracts/plugins/SessionKey.cairo
#[starknet::component]
mod session_component {
    use core::poseidon::{hades_permutation, poseidon_hash_span};
    use starknet::{account::Call, info::get_block_timestamp, get_contract_address, storage::Map};
    use argent::session::interface::{Session, SessionToken, Policy, TypedData};
    use argent::session::session_hash::{
        StructHashSession, OffChainMessageHashSessionRev1, StructHashTypedData
    };
    use argent::signer::signer_signature::{
        Signer, SignerSignature, SignerType, SignerSignatureImpl, SignerTraitImpl
    };

    use controller::asserts::assert_no_self_call;
    use controller::session::interface::{ISession, ISessionCallback};
    use controller::session::session::check_policy;
    use controller::account::IAssertOwner;

    const SESSION_MAGIC: felt252 = 'session-token';
    const AUTHORIZATION_BY_REGISTERED: felt252 = 'authorization-by-registered';

    #[storage]
    struct Storage {
        /// A map of session hashes to a boolean indicating if the session has been revoked.
        revoked_session: Map<felt252, bool>,
        /// A map of (owner_guid, session_hash) to a len of authorization signature
        valid_session_cache: Map<(felt252, felt252), bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        SessionRevoked: SessionRevoked,
        SessionRegistered: SessionRegistered,
    }

    #[derive(Drop, starknet::Event)]
    struct SessionRevoked {
        session_hash: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct SessionRegistered {
        session_hash: felt252,
    }

    mod Errors {
        const LENGHT_MISMATCH: felt252 = 'Length of proofs mismatched';
        const SESSION_EXPIRED: felt252 = 'Session expired';
        const SESSION_REVOKED: felt252 = 'Session has been revoked';
        const SESSION_SIGNATURE_INVALID: felt252 = 'Session signature is invalid';
        const SESSION_TOKEN_INVALID: felt252 = 'Session token not a valid sig';
        const POLICY_CHECK_FAILED: felt252 = 'Policy invalid for given calls';
    }

    #[embeddable_as(SessionComponent)]
    impl SessionImpl<
        TContractState,
        +HasComponent<TContractState>,
        +ISessionCallback<TContractState>,
        +IAssertOwner<TContractState>,
    > of ISession<ComponentState<TContractState>> {
        fn revoke_session(ref self: ComponentState<TContractState>, session_hash: felt252) {
            self.get_contract().assert_owner();

            assert(!self.revoked_session.read(session_hash), 'session/already-revoked');
            self.emit(SessionRevoked { session_hash });
            self.revoked_session.write(session_hash, true);
        }

        fn register_session(
            ref self: ComponentState<TContractState>, session: Session, guid_or_address: felt252,
        ) {
            let contract = self.get_contract();
            contract.assert_owner();

            let now = get_block_timestamp();
            assert(session.expires_at > now, 'session/expired');

            let session_hash = session.get_message_hash_rev_1();
            assert(!self.revoked_session.read(session_hash), 'session/already-revoked');
            assert(
                !self.valid_session_cache.read((guid_or_address, session_hash)),
                'session/already-registered'
            );

            self.valid_session_cache.write((guid_or_address, session_hash), true);
        }

        fn is_session_revoked(
            self: @ComponentState<TContractState>, session_hash: felt252
        ) -> bool {
            self.revoked_session.read(session_hash)
        }

        fn is_session_registered(
            self: @ComponentState<TContractState>, session_hash: felt252, guid_or_address: felt252,
        ) -> bool {
            if self.is_session_revoked(session_hash) {
                return false;
            }

            self.valid_session_cache.read((guid_or_address, session_hash))
        }
        fn is_session_signature_valid(
            self: @ComponentState<TContractState>, data: Span<TypedData>, token: SessionToken
        ) -> bool {
            let mut data = data;
            let mut policies: Array<Policy> = array![];
            let mut hashes: Array<felt252> = array![];
            while let Option::Some(d) = data.pop_front() {
                hashes.append(d.get_struct_hash_rev_1());
                let policy = Policy::TypedData(*d);

                policies.append(policy);
            };
            let hash = poseidon_hash_span(hashes.span());
            let policies = policies.span();

            let _ = self.assert_validate_policy_signature(token, policies, hash);
            true
        }
    }

    #[generate_trait]
    impl InternalImpl<
        TContractState, +HasComponent<TContractState>, +ISessionCallback<TContractState>,
    > of InternalTrait<TContractState> {
        fn validate_session_serialized(
            ref self: ComponentState<TContractState>,
            mut signature: Span<felt252>,
            calls: Span<Call>,
            transaction_hash: felt252,
        ) -> felt252 {
            assert(self.is_session(signature), 'session/invalid-magic-value');
            assert_no_self_call(calls, get_contract_address());

            let mut signature = signature.slice(1, signature.len() - 1);
            let signature: SessionToken = Serde::<SessionToken>::deserialize(ref signature)
                .expect('session/deserialize-error');

            self.validate_signature(signature, calls, transaction_hash);
            starknet::VALIDATED
        }

        #[inline(always)]
        fn is_session(self: @ComponentState<TContractState>, signature: Span<felt252>) -> bool {
            match signature.get(0) {
                Option::Some(session_magic) => *session_magic.unbox() == SESSION_MAGIC,
                Option::None => false
            }
        }

        fn validate_signature(
            ref self: ComponentState<TContractState>,
            signature: SessionToken,
            calls: Span<Call>,
            transaction_hash: felt252,
        ) {
            let mut calls = calls;
            let mut policies: Array<Policy> = array![];
            while let Option::Some(call) = calls.pop_front() {
                policies.append(Policy::Call(*call));
            };
            let policies = policies.span();
            if let Option::Some(cached) = self
                .assert_validate_policy_signature(signature, policies, transaction_hash) {
                self.valid_session_cache.write(cached, true);
            };
        }

        fn assert_validate_policy_signature(
            self: @ComponentState<TContractState>,
            signature: SessionToken,
            calls: Span<Policy>,
            transaction_hash: felt252,
        ) -> Option<(felt252, felt252)> {
            let contract = self.get_contract();
            assert(signature.proofs.len() == calls.len(), 'session/length-mismatch');

            let now = get_block_timestamp();
            assert(signature.session.expires_at > now, 'session/expired');

            // check validity of token
            let session_hash = signature.session.get_message_hash_rev_1();

            let mut to_be_cached = Option::None;

            assert(!self.revoked_session.read(session_hash), 'session/already-revoked');

            if (signature.session_authorization.len() == 2
                && *signature.session_authorization.at(0) == AUTHORIZATION_BY_REGISTERED) {
                let owner_guid = *signature.session_authorization.at(1);
                assert(contract.is_valid_authorizer(owner_guid), 'session/invalid-authorizer');
                assert(signature.cache_authorization, 'session/cache-missing');

                assert(
                    self.valid_session_cache.read((owner_guid, session_hash)),
                    'session/not-registered'
                );
            } else {
                let parsed = contract.parse_authorization(signature.session_authorization);
                let owner_guid = parsed.at(0).clone().signer().into_guid();

                // check validity of token
                if !signature.cache_authorization
                    || !self.valid_session_cache.read((owner_guid, session_hash)) {
                    contract.verify_authorization(session_hash, parsed.span());

                    if signature.cache_authorization {
                        to_be_cached = Option::Some((owner_guid, session_hash));
                    }
                } else {
                    assert(contract.is_valid_authorizer(owner_guid), 'session/invalid-authorizer');
                }
            };

            let (message_hash, _, _) = hades_permutation(transaction_hash, session_hash, 2);

            let session_guid_from_sig = signature.session_signature.signer().into_guid();

            assert(
                signature.session.session_key_guid == session_guid_from_sig,
                'session/session-key-mismatch'
            );

            assert(
                signature.session_signature.is_valid_signature(message_hash),
                'session/invalid-session-sig'
            );

            if signature.session.guardian_key_guid != 0 {
                assert(
                    signature
                        .session
                        .guardian_key_guid == signature
                        .guardian_signature
                        .signer()
                        .into_guid(),
                    'session/invalid-guardian'
                );

                assert(
                    signature.guardian_signature.is_valid_signature(message_hash),
                    'session/invalid-guardian-sig'
                );
            }

            assert(
                check_policy(calls, signature.session.allowed_policies_root, signature.proofs),
                'session/policy-check-failed'
            );

            to_be_cached
        }
    }
}

fn check_policy(array: Span<Policy>, root: felt252, proofs: Span<Span<felt252>>,) -> bool {
    let mut i = 0_usize;
    loop {
        if i >= array.len() {
            break true;
        }
        let leaf = array.at(i).get_merkle_leaf();
        let mut merkle: MerkleTree<Hasher> = MerkleTreeTrait::new();

        if merkle.verify(root, leaf, *proofs.at(i)) == false {
            break false;
        };
        i += 1;
    }
}
