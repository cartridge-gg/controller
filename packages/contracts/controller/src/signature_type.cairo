enum SignatureType {
    SessionTokenV1,
    WebauthnV1
}

#[generate_trait]
impl SignatureTypeImpl of SignatureTypeTrait {
    fn new(value: felt252) -> Option<SignatureType> {
        if value == controller_session::SESSION_TOKEN_V1 {
            Option::Some(SignatureType::SessionTokenV1)
        } else if value == controller_auth::WEBAUTHN_V1 {
            Option::Some(SignatureType::WebauthnV1)
        } else {
            Option::None
        }
    }
}
