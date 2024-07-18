use starknet::account::Call;
use argent::signer::signer_signature::SignerSignature;
use argent::session::interface::Session;


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
    fn register_session(ref self: TContractState, session: Session);
    fn is_session_revoked(self: @TContractState, session_hash: felt252) -> bool;
}

