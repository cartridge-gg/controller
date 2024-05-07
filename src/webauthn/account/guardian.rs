use starknet::providers::Provider;

use crate::webauthn::signers::Signer;

pub struct WebauthnGuardianAccount<P, S, G> 
where
    P: Provider + Send,
    S: Signer + Send,
    G: Signer + Send {
        account: WebauthnAccount<P, S>,
    }