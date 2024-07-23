use starknet::core::types::{Felt, NonZeroFelt};

pub const ACCOUNT_CLASS_HASH: &str =
    "0x5f0f2ae9301e0468ca3f9218dadd43a448a71acc66b6ef1a5570bb56cf10c6f";

pub const PREFIX_CONTRACT_ADDRESS: Felt = Felt::from_raw([
    533439743893157637,
    8635008616843941496,
    17289941567720117366,
    3829237882463328880,
]);

pub const ADDR_BOUND: NonZeroFelt = NonZeroFelt::from_raw([
    576459263475590224,
    18446744073709255680,
    160989183,
    18446743986131443745,
]);
