use starknet::{
    macros::{felt, short_string},
    signers::SigningKey,
};
use starknet_crypto::Felt;

use crate::signers::Signer;

pub const STRK_CONTRACT_ADDRESS: Felt =
    felt!("0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D");
pub const WEBAUTHN_GAS: Felt = felt!("3300");

pub const GUARDIAN_SIGNER: Signer = Signer::Starknet(SigningKey::from_secret_scalar(
    short_string!("CARTRIDGE_GUARDIAN"),
));
