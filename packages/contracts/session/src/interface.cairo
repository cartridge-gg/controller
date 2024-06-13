use starknet::account::Call;
use controller_auth::signer::SignerSignature;


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


#[derive(Drop, Serde, Copy)]
struct Session {
    expires_at: u64,
    allowed_methods_root: felt252,
    metadata_hash: felt252,
    session_key_guid: felt252,
}

#[derive(Drop, Serde, Copy)]
struct SessionToken {
    session: Session,
    session_authorization: Span<felt252>,
    session_signature: SignerSignature,
    guardian_signature: SignerSignature,
    proofs: Span<Span<felt252>>,
}

#[starknet::interface]
trait ISession<TContractState> {
    fn revoke_session(ref self: TContractState, session_hash: felt252);
    fn is_session_revoked(self: @TContractState, session_hash: felt252) -> bool;
}

#[starknet::interface]
trait ISessionCallback<TContractState> {
    fn session_callback(
        self: @TContractState, session_hash: felt252, authorization_signature: Span<felt252>
    ) -> bool;
}
