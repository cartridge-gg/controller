mod account;
mod hash;
mod sequence;
mod session;

pub use account::SessionAccount;
pub use sequence::CallSequence;
pub use session::Session;

use starknet::macros::felt;
use starknet_crypto::FieldElement;

pub const SESSION_SIGNATURE_TYPE: FieldElement = felt!("0x53657373696f6e20546f6b656e207631"); // 'Session Token v1'
