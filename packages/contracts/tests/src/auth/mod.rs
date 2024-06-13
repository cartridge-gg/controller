use proptest::prelude::*;

use crate::prelude::*;

mod expand_auth_data;
mod helpers;
mod verify_ecdsa;
mod verify_signature;

#[derive(Debug, Clone, PartialEq)]
pub struct CairoU256 {
    low: Felt252,
    high: Felt252,
}

impl CairoU256 {
    pub fn new(low: Felt252, high: Felt252) -> Self {
        Self { low, high }
    }
    pub fn from_bytes_be(low: &[u8; 16], high: &[u8; 16]) -> Self {
        Self::new(Felt252::from_bytes_be(low), Felt252::from_bytes_be(high))
    }
    pub fn from_byte_slice_be(bytes: &[u8; 32]) -> Self {
        let (low, high): (&[u8; 16], &[u8; 16]) = (
            bytes[16..].try_into().unwrap(),
            bytes[..16].try_into().unwrap(),
        );
        Self::from_bytes_be(low, high)
    }
    pub fn zero() -> Self {
        Self::new(Felt252::from(0), Felt252::from(0))
    }
}

impl Arbitrary for CairoU256 {
    type Parameters = ();
    type Strategy = BoxedStrategy<CairoU256>;

    fn arbitrary_with(_args: ()) -> BoxedStrategy<CairoU256> {
        (any::<u128>(), any::<u128>())
            .prop_map(|(low, high)| Self::new(low.into(), high.into()))
            .boxed()
    }
}

impl FeltSerialize for CairoU256 {
    fn to_felts(self) -> Vec<Felt252> {
        vec![self.low, self.high]
    }
}

struct P256r1PublicKey {
    x: CairoU256,
    y: CairoU256,
}

impl P256r1PublicKey {
    pub fn new(x: CairoU256, y: CairoU256) -> Self {
        Self { x, y }
    }
    pub fn from_bytes_be(x: &[u8; 32], y: &[u8; 32]) -> Self {
        Self::new(
            CairoU256::from_byte_slice_be(x),
            CairoU256::from_byte_slice_be(y),
        )
    }
}

impl FeltSerialize for P256r1PublicKey {
    fn to_felts(self) -> Vec<Felt252> {
        self.x
            .to_felts()
            .into_iter()
            .chain(self.y.to_felts())
            .collect()
    }
}

#[test]
fn test_contains_trait() {
    let target = "../../../target/dev/controller_auth.sierra.json";
    let function = "test_array_contains";
    let args = vec![
        arg_array![5, 1, 2, 4, 8, 16, 6, 1, 2, 3, 4, 5, 6],
        arg_value!(2),
    ];
    let result = cairo_args_runner::run(target, function, &args).unwrap();

    assert_eq!(result.len(), 1);
    assert_eq!(result[0], true.into());
}
