use lazy_static::lazy_static;
use starknet::core::types::Felt;
use starknet::macros::felt;

pub(crate) mod declare;
mod pending;

pub use declare::AccountDeclaration;

lazy_static! {
    pub static ref UDC_ADDRESS: Felt =
        felt!("0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf");
    pub static ref FEE_TOKEN_ADDRESS: Felt =
        felt!("0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D");
}
