use alexandria_data_structures::array_ext::ArrayTraitExt;
use core::box::BoxTrait;
use core::array::SpanTrait;
use starknet::info::{TxInfo, get_tx_info, get_block_timestamp};
use starknet::account::Call;
use core::result::ResultTrait;
use core::option::OptionTrait;
use core::array::ArrayTrait;
use core::{TryInto, Into};
use starknet::contract_address::ContractAddress;
use alexandria_merkle_tree::merkle_tree::{
    Hasher, MerkleTree, poseidon::PoseidonHasherImpl, MerkleTreeTrait
};
use argent::session::session_hash::MerkleLeafHash;
use core::ecdsa::check_ecdsa_signature;


const SESSION_TOKEN_V1: felt252 = 'session-token';

// Based on https://github.com/argentlabs/starknet-plugin-account/blob/3c14770c3f7734ef208536d91bbd76af56dc2043/contracts/plugins/SessionKey.cairo
#[starknet::component]
mod session_component {
    use core::num::traits::zero::Zero;
    use core::result::ResultTrait;
    use controller::session::session::check_policy;
    use starknet::info::{TxInfo, get_tx_info, get_block_timestamp, get_caller_address};
    use starknet::account::Call;
    use core::ecdsa::check_ecdsa_signature;
    use alexandria_merkle_tree::merkle_tree::{
        Hasher, MerkleTree, poseidon::PoseidonHasherImpl, MerkleTreeTrait
    };
    use starknet::contract_address::ContractAddress;
    use starknet::get_contract_address;
    use controller::session::interface::{
        ISession, SessionState, SessionStateImpl
    };
    use argent::session::interface::{Session, ISessionCallback, SessionToken};
    use argent::session::session_hash::{StructHashSession, OffChainMessageHashSessionRev1};
    use argent::signer::signer_signature::{Signer, SignerSignature, SignerType, SignerSignatureImpl, SignerTraitImpl};
    use controller::session::session::SESSION_TOKEN_V1;
    use core::poseidon::{hades_permutation, poseidon_hash_span};
    use controller::account::{IAllowedCallerCallback, IUserAccount};
    use controller::utils::assert_no_self_call;

    #[storage]
    struct Storage {
        /// A map of session hashes to a boolean indicating if the session has been revoked.
        revoked_session: LegacyMap<felt252, bool>,
        /// A map of (owner_guid, guardian_guid, session_hash) to a len of authorization signature
        valid_session_cache: LegacyMap<(felt252, felt252, felt252), bool>,
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
        +IAllowedCallerCallback<TContractState>,
        +IUserAccount<TContractState>
    > of ISession<ComponentState<TContractState>> {
        fn revoke_session(ref self: ComponentState<TContractState>, session_hash: felt252) {
            self.get_contract().is_caller_allowed(get_caller_address());
            assert(!self.revoked_session.read(session_hash), 'session/already-revoked');
            self.emit(SessionRevoked { session_hash });
            self.revoked_session.write(session_hash, true);
        }
        fn register_session(
            ref self: ComponentState<TContractState>,
            session: Session
        ) {
            let state = self.get_contract();
            state.is_caller_allowed(get_caller_address());
            let now = get_block_timestamp();
            assert(session.expires_at > now, 'session/expired');
            let session_hash = session.get_message_hash_rev_1();
            assert(!self.revoked_session.read(session_hash), 'session/already-revoked');
            
            let owner_guid = state.get_owner_guid();
            let guardian_guid = match state.get_guardian_guid() {
                Option::Some(guid) => guid,
                Option::None => 0
            };
            // check validity of token
            assert(!self.valid_session_cache.read((owner_guid, guardian_guid, session_hash)), 'session/already-registered');
            self.valid_session_cache.write((owner_guid, guardian_guid, session_hash), true);
        }
        fn is_session_revoked(
            self: @ComponentState<TContractState>, session_hash: felt252
        ) -> bool {
            self.revoked_session.read(session_hash)
        }
    }


    #[generate_trait]
    impl InternalImpl<
        TContractState, 
        +HasComponent<TContractState>, 
        +ISessionCallback<TContractState>,
        +IUserAccount<TContractState>
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

            match self.validate_signature(signature, calls, transaction_hash) {
                Result::Ok(_) => { starknet::VALIDATED },
                Result::Err(e) => { e }
            }
        }

        #[inline(always)]
        fn is_session(self: @ComponentState<TContractState>, signature: Span<felt252>) -> bool {
            match signature.get(0) {
                Option::Some(session_magic) => *session_magic.unbox() == SESSION_TOKEN_V1,
                Option::None => false
            }
        }
        fn validate_signature(
            ref self: ComponentState<TContractState>,
            signature: SessionToken,
            calls: Span<Call>,
            transaction_hash: felt252,
        ) -> Result<(), felt252> {
            let state = self.get_contract();
            if signature.proofs.len() != calls.len() {
                return Result::Err(Errors::LENGHT_MISMATCH);
            };

            let now = get_block_timestamp();
            if signature.session.expires_at <= now {
                return Result::Err(Errors::SESSION_EXPIRED);
            }

            // check validity of token
            let session_hash = signature.session.get_message_hash_rev_1();

            assert(!self.revoked_session.read(session_hash), 'session/already-revoked');
            
            let owner_guid = state.get_owner_guid();
            let guardian_guid = match state.get_guardian_guid() {
                Option::Some(guid) => guid,
                Option::None => 0
            };
            // check validity of token
            if !signature.cache_authorization ||
                !self.valid_session_cache.read((owner_guid, guardian_guid, session_hash))
            {
                state.parse_and_verify_authorization(session_hash, signature.session_authorization);
                if signature.cache_authorization {
                    self.valid_session_cache.write((owner_guid, guardian_guid, session_hash), true);
                }
            }

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

            if check_policy(calls, signature.session.allowed_methods_root, signature.proofs)
                .is_err() {
                return Result::Err(Errors::POLICY_CHECK_FAILED);
            }

            Result::Ok(())
        }
    }
}

fn check_policy(
    call_array: Span<Call>, root: felt252, proofs: Span<Span<felt252>>,
) -> Result<(), ()> {
    let mut i = 0_usize;
    loop {
        if i >= call_array.len() {
            break Result::Ok(());
        }
        let leaf = call_array.at(i).get_merkle_leaf();
        let mut merkle: MerkleTree<Hasher> = MerkleTreeTrait::new();

        if merkle.verify(root, leaf, *proofs.at(i)) == false {
            break Result::Err(());
        };
        i += 1;
    }
}
