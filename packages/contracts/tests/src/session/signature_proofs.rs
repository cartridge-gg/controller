use std::vec;

use crate::prelude::*;

pub struct SignatureProofsParser;

pub type SigProofs = Vec<Vec<Felt252>>;

impl ArgumentParser for SignatureProofsParser {
    type Args = (SigProofs, usize);

    fn parse(&self, args: (Vec<Vec<Felt252>>, usize)) -> Vec<Arg> {
        ArgsBuilder::new()
            .add_array(args.0.into_iter().flatten())
            .add_one(args.1)
            .build()
    }
}

pub struct SignatureProofsExtractor;

impl ResultExtractor for SignatureProofsExtractor {
    type Result = SigProofs;

    fn extract(&self, result: Result<SuccessfulRun, SierraRunnerError>) -> Self::Result {
        let result = result.unwrap();
        let to_u32 = |felt: &Felt252| felt.to_bigint().try_into().unwrap();
        let (start, end): (usize, usize) = (to_u32(&result.value[1]), to_u32(&result.value[2]));
        result.memory[start..end]
            .iter()
            .cloned()
            .collect::<Option<Vec<_>>>()
            .unwrap()
            .chunks(2)
            .map(|arr| (arr[0].clone(), arr[1].clone()))
            .map(|(ref s, ref e)| (to_u32(s), to_u32(e)))
            .map(|(s, e)| result.memory[s..e].iter().cloned().collect())
            .collect::<Option<_>>()
            .unwrap()
    }
}

pub const SIGNATURE_PROOFS: Function<SignatureProofsParser, SignatureProofsExtractor> =
    Function::new_session(
        "signature_proofs_endpoint",
        SignatureProofsParser,
        SignatureProofsExtractor,
    );

#[test]
fn test_signature_proofs_1() {
    let proofs = vec![vec![1.into()], vec![2.into()]];
    let result = SIGNATURE_PROOFS.run((proofs.clone(), 1));
    assert_eq!(result, proofs);
}

#[test]
fn test_signature_proofs_2() {
    let proofs: Vec<_> = (0..100).map(|i| vec![Felt252::from(i); 19]).collect();
    let result = SIGNATURE_PROOFS.run((proofs.clone(), 19));
    assert_eq!(result, proofs);
}
