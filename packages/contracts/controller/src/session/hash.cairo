use super::interface::{Session, SessionToken};
use core::hash::{HashStateExTrait, HashStateTrait};
use core::poseidon::{hades_permutation, poseidon_hash_span, HashState};
use starknet::{get_contract_address, get_tx_info, account::Call};


const MAINNET_FIRST_HADES_PERMUTATION: (felt252, felt252, felt252) =
    (
        3159357451750963173197764487250193801745009044296318704413979805593222351753,
        2856607116111318915813829371903536205200021468882518469573183227809900863246,
        2405333218043798385503929428387279699579326006043041470088260529024671365157
    );

const SEPOLIA_FIRST_HADES_PERMUTATION: (felt252, felt252, felt252) =
    (
        691798498452391354097240300284680479233893583850648846821812933705410085810,
        317062340895242311773051982041708757540909251525159061717012359096590796798,
        517893314125397876808992724850240644188517690767234330219248407741294215037
    );


const SESSION_TYPE_HASH_REV_1: felt252 =
    selector!(
        "\"Session\"(\"Expires At\":\"timestamp\",\"Allowed Methods\":\"merkletree\",\"Metadata\":\"string\",\"Session Key\":\"felt\")"
    );

const ALLOWED_METHOD_HASH_REV_1: felt252 =
    selector!(
        "\"Allowed Method\"(\"Contract Address\":\"ContractAddress\",\"selector\":\"selector\")"
    );


fn get_merkle_leaf(call: @Call) -> felt252 {
    poseidon_hash_span(array![ALLOWED_METHOD_HASH_REV_1, (*call.to).into(), *call.selector].span())
}

fn authorization_hash(session_authorization: Span<felt252>) -> felt252 {
    poseidon_hash_span(session_authorization)
}

trait IStructHashRev1<T> {
    fn get_struct_hash_rev_1(self: @T) -> felt252;
}

impl StructHashSession of IStructHashRev1<Session> {
    fn get_struct_hash_rev_1(self: @Session) -> felt252 {
        let self = *self;
        poseidon_hash_span(
            array![
                SESSION_TYPE_HASH_REV_1,
                self.expires_at.into(),
                self.allowed_methods_root,
                self.metadata_hash,
                self.session_key_guid
            ]
                .span()
        )
    }
}


fn get_message_hash_rev_1(session: @Session) -> felt252 {
    let chain_id = get_tx_info().unbox().chain_id;
    if chain_id == 'SN_MAIN' {
        return get_message_hash_rev_1_with_precalc(MAINNET_FIRST_HADES_PERMUTATION, *session);
    }
    if chain_id == 'SN_SEPOLIA' {
        return get_message_hash_rev_1_with_precalc(SEPOLIA_FIRST_HADES_PERMUTATION, *session);
    }
    let domain = StarknetDomain {
        name: 'SessionAccount.session', version: '1', chain_id, revision: 1,
    };
    poseidon_hash_span(
        array![
            'StarkNet Message',
            domain.get_struct_hash_rev_1(),
            get_contract_address().into(),
            session.get_struct_hash_rev_1()
        ]
            .span()
    )
}


fn get_message_hash_rev_1_with_precalc<T, +Drop<T>, +IStructHashRev1<T>>(
    hades_permutation_state: (felt252, felt252, felt252), rev1_struct: T
) -> felt252 {
    // mainnet_domain_hash = domain.get_struct_hash_rev_1()
    // hades_permutation_state == hades_permutation('StarkNet Message', mainnet_domain_hash, 0);
    let (s0, s1, s2) = hades_permutation_state;

    let (fs0, fs1, fs2) = hades_permutation(
        s0 + get_contract_address().into(), s1 + rev1_struct.get_struct_hash_rev_1(), s2
    );
    HashState { s0: fs0, s1: fs1, s2: fs2, odd: false }.finalize()
}

#[derive(Hash, Drop, Copy)]
struct StarknetDomain {
    name: felt252,
    version: felt252,
    chain_id: felt252,
    revision: felt252,
}

const STARKNET_DOMAIN_TYPE_HASH_REV_1: felt252 =
    selector!(
        "\"StarknetDomain\"(\"name\":\"shortstring\",\"version\":\"shortstring\",\"chainId\":\"shortstring\",\"revision\":\"shortstring\")"
    );

impl StructHashStarknetDomain of IStructHashRev1<StarknetDomain> {
    fn get_struct_hash_rev_1(self: @StarknetDomain) -> felt252 {
        poseidon_hash_span(
            array![
                STARKNET_DOMAIN_TYPE_HASH_REV_1,
                *self.name,
                *self.version,
                *self.chain_id,
                *self.revision
            ]
                .span()
        )
    }
}
