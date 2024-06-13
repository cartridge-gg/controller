use core::traits::Into;

#[derive(Drop)]
enum AuthnError {
    TransportNotAllowed,
    GetCredentialRejected,
    ResponseIsNotAttestation,
    CredentialNotAllowed,
    KeyRetirevalFailed,
    IdentifiedUsersMismatch,
    ChallengeMismatch,
    OriginMismatch,
    InvalidAuthData,
    RelyingPartyIdHashMismatch,
    UserFlagsMismatch,
    InvalidPublicKey,
    InvalidSignature
}

impl AuthnErrorIntoFelt252 of Into<AuthnError, felt252> {
    fn into(self: AuthnError) -> felt252 {
        match self {
            AuthnError::TransportNotAllowed => 'TransportNotAllowed',
            AuthnError::GetCredentialRejected => 'GetCredentialRejected',
            AuthnError::ResponseIsNotAttestation => 'ResponseIsNotAttestation',
            AuthnError::CredentialNotAllowed => 'CredentialNotAllowed',
            AuthnError::KeyRetirevalFailed => 'KeyRetirevalFailed',
            AuthnError::IdentifiedUsersMismatch => 'IdentifiedUsersMismatch',
            AuthnError::ChallengeMismatch => 'ChallengeMismatch',
            AuthnError::OriginMismatch => 'OriginMismatch',
            AuthnError::InvalidAuthData => 'InvalidAuthData',
            AuthnError::RelyingPartyIdHashMismatch => 'RelyingPartyIdHashMismatch',
            AuthnError::UserFlagsMismatch => 'UserFlagsMismatch',
            AuthnError::InvalidPublicKey => 'InvalidPublicKey',
            AuthnError::InvalidSignature => 'InvalidSignature',
        }
    }
}

// Probably this should not exist
enum StoreError {
    KeyRetirevalFailed
}

impl AuthnErrorIntoResultT<T> of Into<AuthnError, Result<T, AuthnError>> {
    fn into(self: AuthnError) -> Result<T, AuthnError> {
        Result::Err(self)
    }
}

impl RTSEIntoRTAE<T> of Into<Result<T, StoreError>, Result<T, AuthnError>> {
    fn into(self: Result<T, StoreError>) -> Result<T, AuthnError> {
        match self {
            Result::Ok(t) => Result::Ok(t),
            Result::Err(e) => match e {
                StoreError::KeyRetirevalFailed => AuthnError::KeyRetirevalFailed.into()
            }
        }
    }
}
