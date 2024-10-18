use starknet::account::Call;
use argent::signer::signer_signature::{SignerSignature, Signer};
use argent::session::interface::{Session, TypedData, SessionToken};


#[derive(Drop, Serde, Copy, PartialEq)]
enum SessionState {
    NotRegistered,
    Revoked,
    Validated: felt252,
}

#[generate_trait]
impl SessionStateImpl of SessionStateTrait {
    fn from_felt(felt: felt252) -> SessionState {
        match felt {
            0 => SessionState::NotRegistered,
            1 => SessionState::Revoked,
            _ => SessionState::Validated(felt),
        }
    }
    fn into_felt(self: SessionState) -> felt252 {
        match self {
            SessionState::NotRegistered => 0,
            SessionState::Revoked => 1,
            SessionState::Validated(hash) => hash,
        }
    }
}

#[starknet::interface]
trait ISession<TContractState> {
    fn revoke_session(ref self: TContractState, session_hash: felt252);
    fn register_session(ref self: TContractState, session: Session, guid_or_address: felt252,);
    fn is_session_revoked(self: @TContractState, session_hash: felt252) -> bool;
    fn is_session_registered(
        self: @TContractState, session_hash: felt252, guid_or_address: felt252,
    ) -> bool;
    fn is_session_sigature_valid(self: @TContractState, data: Span<TypedData>, token: SessionToken) -> bool;
}

#[starknet::interface]
trait ISessionCallback<TContractState> {
    fn parse_authorization(
        self: @TContractState, authorization_signature: Span<felt252>
    ) -> Array<SignerSignature>;
    fn is_valid_authorizer(self: @TContractState, guid_or_address: felt252) -> bool;
    fn verify_authorization(
        self: @TContractState, session_hash: felt252, authorization_signature: Span<SignerSignature>
    );
}

