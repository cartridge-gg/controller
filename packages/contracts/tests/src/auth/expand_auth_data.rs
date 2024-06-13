use proptest::{collection, prelude::*};

use crate::prelude::*;

struct AuthDataParser;
impl ArgumentParser for AuthDataParser {
    type Args = AuthenticatorData;

    fn parse(&self, args: Self::Args) -> Vec<Arg> {
        ArgsBuilder::new().add_array(args.to_felts()).build()
    }
}

struct AuthDataExtractor;

impl ResultExtractor for AuthDataExtractor {
    type Result = AuthenticatorData;

    fn extract(&self, result: Result<SuccessfulRun, SierraRunnerError>) -> Self::Result {
        let result = result.unwrap();
        let felts: Vec<Felt252> = result.value;
        let rp_id_hash: Vec<u8> = result.memory
            [felts[0].to_bigint().try_into().unwrap()..felts[1].to_bigint().try_into().unwrap()]
            .iter()
            .map(|x| x.clone().unwrap().to_bigint().try_into().unwrap())
            .collect();
        AuthenticatorData {
            rp_id_hash: rp_id_hash.try_into().unwrap(),
            flags: felts[2].to_bigint().try_into().unwrap(),
            sign_count: felts[3].to_bigint().try_into().unwrap(),
        }
    }
}

const EXPAND_AUTH_DATA: Function<AuthDataParser, AuthDataExtractor> = Function::new_webauthn(
    "expand_auth_data_endpoint",
    AuthDataParser,
    AuthDataExtractor,
);

#[derive(Debug, PartialEq, Clone)]
pub struct AuthenticatorData {
    pub rp_id_hash: [u8; 32],
    pub flags: u8,
    pub sign_count: u32,
}

impl Arbitrary for AuthenticatorData {
    type Parameters = ();
    type Strategy = proptest::strategy::BoxedStrategy<Self>;

    fn arbitrary_with(_: Self::Parameters) -> Self::Strategy {
        (collection::vec(any::<u8>(), 32), any::<u8>(), any::<u32>())
            .prop_map(|(rp_id_hash, flags, sign_count)| Self {
                rp_id_hash: rp_id_hash.try_into().unwrap(),
                flags,
                sign_count,
            })
            .boxed()
    }
}

impl AuthenticatorData {
    #[allow(dead_code)]
    pub fn from_bytes(bytes: &[u8]) -> Self {
        let rp_id_hash = bytes[0..32].try_into().unwrap();
        let flags = bytes[32];
        let sign_count = u32::from_be_bytes(bytes[33..37].try_into().unwrap());
        Self {
            rp_id_hash,
            flags,
            sign_count,
        }
    }
}

impl FeltSerialize for AuthenticatorData {
    fn to_felts(self) -> Vec<Felt252> {
        let mut felts: Vec<_> = self.rp_id_hash.iter().cloned().map(Felt252::from).collect();
        felts.push(self.flags.into());
        felts.extend(
            self.sign_count
                .to_be_bytes()
                .iter()
                .cloned()
                .map(Felt252::from),
        );
        felts
    }
}

#[test]
fn test_expand_auth_data_1() {
    let d: Vec<u8> = (0_u8..32_u8).collect();
    let auth_data = AuthenticatorData {
        rp_id_hash: d.try_into().unwrap(),
        flags: 0,
        sign_count: 0,
    };
    assert_eq!(EXPAND_AUTH_DATA.run(auth_data.clone()), auth_data);
}

proptest! {
    #[test]
    fn test_expand_auth_data_prop(
        auth_data in any::<AuthenticatorData>(),
    ) {
        assert_eq!(EXPAND_AUTH_DATA.run(auth_data.clone()), auth_data);
    }
}
