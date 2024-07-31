use lazy_static::lazy_static;
use starknet::core::types::Felt;
use starknet::macros::felt;

pub(crate) mod declare;
mod deploy;
// mod interface;
mod pending;
pub(crate) mod webauthn;

pub use declare::AccountDeclaration;
pub use deploy::AccountDeployment;
pub use deploy::DeployResult;

lazy_static! {
    pub static ref UDC_ADDRESS: Felt =
        felt!("0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf");
    pub static ref FEE_TOKEN_ADDRESS: Felt =
        felt!("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7");
    pub static ref ERC20_CONTRACT_CLASS_HASH: Felt =
        felt!("0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f");
    pub static ref CHAIN_ID: Felt =
        felt!("0x00000000000000000000000000000000000000000000000000004b4154414e41");
}
