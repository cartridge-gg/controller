use starknet::{
    macros::{felt, short_string},
    signers::SigningKey,
};
use starknet_crypto::Felt;

use crate::signers::Signer;

pub const ETH_CONTRACT_ADDRESS: Felt =
    felt!("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7");
pub const WEBAUTHN_GAS: Felt = felt!("3300");

pub const GUARDIAN_SIGNER: Signer = Signer::Starknet(SigningKey::from_secret_scalar(
    short_string!("CARTRIDGE_GUARDIAN"),
));
