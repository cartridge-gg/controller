use super::*;
use crate::*;

struct U256ArrParser;

impl ArgumentParser for U256ArrParser {
    type Args = (Vec<u8>, usize);

    fn parse(&self, args: (Vec<u8>, usize)) -> Vec<Arg> {
        ArgsBuilder::new().add_array(args.0).add_one(args.1).build()
    }
}

struct U256Extractor;

impl ResultExtractor for U256Extractor {
    type Result = Option<CairoU256>;

    fn extract(&self, result: Result<SuccessfulRun, SierraRunnerError>) -> Self::Result {
        let result = result.unwrap();
        let felts: Vec<Felt252> = result.value;
        if felts[0] == Felt252::from(1) {
            None
        } else {
            Some(CairoU256 {
                low: felts[1].clone(),
                high: felts[2].clone(),
            })
        }
    }
}

const EXTRACT_U256_FROM_U8_ARRAY: utils::Function<U256ArrParser, U256Extractor> =
    Function::new_webauthn("extract_u256_from_u8_array", U256ArrParser, U256Extractor);

fn serialize_and_extract_u256(val: CairoU256, offset: usize) -> CairoU256 {
    let low = val.low.to_bytes_be();
    let high = val.high.to_bytes_be();

    let bytes = [
        vec![0; offset + 16 - high.len()],
        high,
        vec![0; 16 - low.len()],
        low,
    ]
    .concat();
    let result = EXTRACT_U256_FROM_U8_ARRAY.run((bytes, offset));
    result.unwrap()
}

#[test]
fn test_extract_u256_from_u8_array_1() {
    let result = EXTRACT_U256_FROM_U8_ARRAY.run(([0u8; 32].to_vec(), 0));
    assert_eq!(result, Some(CairoU256::zero()));
}

#[test]
fn test_extract_u256_from_u8_array_2() {
    let val = CairoU256 {
        low: Felt252::from(12345),
        high: Felt252::from(98765),
    };
    assert_eq!(serialize_and_extract_u256(val.clone(), 0), val);
}

#[test]
fn test_extract_u256_from_u8_array_fail_1() {
    let result = EXTRACT_U256_FROM_U8_ARRAY.run(([0u8; 32].to_vec(), 3));
    assert_eq!(result, None);
}

proptest! {
    #[test]
    fn test_extract_u256_from_u8_array_prop(
        val in any::<CairoU256>()
    ) {
        assert_eq!(serialize_and_extract_u256(val.clone(), 0), val);
    }
}
