// Inspired by:
// https://github.com/argentlabs/argent-contracts-starknet/blob/main/src/signer/signer_signature.cairo
use controller_auth::webauthn::{verify, WebauthnAssertion, get_webauthn_hash};
use controller_auth::eip191::is_valid_eip191_signature;
use starknet::secp256_trait::{Secp256PointTrait, Signature as Secp256Signature, recover_public_key};
use core::ecdsa::check_ecdsa_signature;
use starknet::{
    EthAddress, secp256r1::Secp256r1Point,
    eth_signature::{Signature as Secp256k1Signature, is_eth_signature_valid}
};
use core::poseidon::{hades_permutation, PoseidonTrait};
use core::hash::{HashStateExTrait, HashStateTrait};

const STARKNET_SIGNER_TYPE: felt252 = 'Starknet Signer';
const SECP256K1_SIGNER_TYPE: felt252 = 'Secp256k1 Signer';
const EIP191_SIGNER_TYPE: felt252 = 'Eip191 Signer';
const WEBAUTHN_SIGNER_TYPE: felt252 = 'Webauthn Signer';

const SECP_256_K1_HALF: u256 = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141 / 2;

#[derive(Drop, Copy, Serde)]
enum Signer {
    Starknet: StarknetSigner,
    Secp256k1: Secp256k1Signer,
    Eip191: Eip191Signer,
    Webauthn: WebauthnSigner,
    Unimplemented
}

#[derive(Drop, Copy, Serde)]
enum SignerSignature {
    Starknet: (StarknetSigner, StarknetSignature),
    Secp256k1: (Secp256k1Signer, Secp256Signature),
    Eip191: (Eip191Signer, Secp256Signature),
    Webauthn: (WebauthnSigner, WebauthnAssertion),
    Unimplemented
}

#[derive(Drop, Copy, Serde, PartialEq)]
struct StarknetSignature {
    r: felt252,
    s: felt252,
}

#[derive(Drop, Copy, Serde, PartialEq)]
struct StarknetSigner {
    pubkey: NonZero<felt252>
}

/// @param pubkey_hash the right-most 160 bits of a Keccak hash of an ECDSA public key
#[derive(Drop, Copy, PartialEq)]
struct Secp256k1Signer {
    pubkey_hash: EthAddress
}


// Ensures that the pubkey_hash is not zero as we can't do NonZero<EthAddress>
impl Secp256k1SignerSerde of Serde<Secp256k1Signer> {
    #[inline(always)]
    fn serialize(self: @Secp256k1Signer, ref output: Array<felt252>) {
        self.pubkey_hash.serialize(ref output);
    }

    #[inline(always)]
    fn deserialize(ref serialized: Span<felt252>) -> Option<Secp256k1Signer> {
        let pubkey_hash = Serde::<EthAddress>::deserialize(ref serialized)?;
        assert(pubkey_hash.address != 0, 'zero-pubkey-hash');
        Option::Some(Secp256k1Signer { pubkey_hash })
    }
}

#[derive(Drop, Copy, PartialEq)]
struct Eip191Signer {
    eth_address: EthAddress
}

impl Eip191SignerSerde of Serde<Eip191Signer> {
    #[inline(always)]
    fn serialize(self: @Eip191Signer, ref output: Array<felt252>) {
        self.eth_address.serialize(ref output);
    }

    #[inline(always)]
    fn deserialize(ref serialized: Span<felt252>) -> Option<Eip191Signer> {
        let eth_address = Serde::<EthAddress>::deserialize(ref serialized)?;
        assert(eth_address.address != 0, 'eip191/zero-eth-EthAddress');
        Option::Some(Eip191Signer { eth_address })
    }
}

#[derive(Drop, Copy, Serde, PartialEq)]
struct WebauthnSigner {
    origin: Span<u8>,
    rp_id_hash: NonZero<u256>,
    pubkey: NonZero<u256>
}


trait SignerSignatureTrait {
    fn is_valid_signature(self: SignerSignature, hash: felt252) -> bool;
    fn signer(self: SignerSignature) -> Signer;
}

impl SignerSignatureImpl of SignerSignatureTrait {
    #[inline(always)]
    fn is_valid_signature(self: SignerSignature, hash: felt252) -> bool {
        match self {
            SignerSignature::Starknet((
                signer, signature
            )) => is_valid_starknet_signature(hash, signer, signature),
            SignerSignature::Secp256k1((
                signer, signature
            )) => is_valid_secp256k1_signature(hash.into(), signer.pubkey_hash, signature),
            SignerSignature::Eip191((
                signer, signature
            )) => is_valid_eip191_signature(hash, signer, signature),
            SignerSignature::Webauthn((
                signer, signature
            )) => is_valid_webauthn_signature(hash, signer, signature),
            SignerSignature::Unimplemented => false
        }
    }
    #[inline(always)]
    fn signer(self: SignerSignature) -> Signer {
        match self {
            SignerSignature::Starknet((signer, _)) => Signer::Starknet(signer),
            SignerSignature::Secp256k1((signer, _)) => Signer::Secp256k1(signer),
            SignerSignature::Eip191((signer, _)) => Signer::Eip191(signer),
            SignerSignature::Webauthn((signer, _)) => Signer::Webauthn(signer),
            SignerSignature::Unimplemented => Signer::Unimplemented
        }
    }
}

#[inline(always)]
fn is_valid_starknet_signature(
    hash: felt252, signer: StarknetSigner, signature: StarknetSignature
) -> bool {
    check_ecdsa_signature(hash, signer.pubkey.into(), signature.r, signature.s)
}

#[inline(always)]
fn is_valid_secp256k1_signature(
    hash: u256, pubkey_hash: EthAddress, signature: Secp256k1Signature
) -> bool {
    assert(signature.s <= SECP_256_K1_HALF, 'secp256k1/malleable-signature');
    is_eth_signature_valid(hash, signature, pubkey_hash.into()).is_ok()
}

#[inline(always)]
fn is_valid_secp256r1_signature(
    hash: u256, pubkey: NonZero<u256>, signature: Secp256Signature
) -> bool {
    let recovered = recover_public_key::<Secp256r1Point>(hash, signature)
        .expect('invalid-sig-format');
    let (recovered_signer, _) = recovered.get_coordinates().expect('invalid-sig-format');
    recovered_signer == pubkey.into()
}

#[inline(always)]
fn is_valid_webauthn_signature(
    hash: felt252, signer: WebauthnSigner, assertion: WebauthnAssertion
) -> bool {
    verify(
        assertion.type_offset,
        assertion.challenge_offset,
        assertion.origin_offset,
        assertion.client_data_json,
        hash,
        assertion.authenticator_data
    )
        .expect('invalid ');
    let signed_hash = get_webauthn_hash(assertion);
    is_valid_secp256r1_signature(signed_hash, signer.pubkey, assertion.signature)
}

#[inline(always)]
fn poseidon_2(a: felt252, b: felt252) -> felt252 {
    let (hash, _, _) = core::poseidon::hades_permutation(a, b, 2);
    hash
}

#[derive(Drop, Copy, Serde, PartialEq)]
struct SignerStorageValue {
    stored_value: felt252,
    signer_type: SignerType,
}

#[generate_trait]
impl SignerStorageValueImpl of SignerStorageTrait {
    fn into_guid(self: SignerStorageValue) -> felt252 {
        match self.signer_type {
            SignerType::Starknet => poseidon_2(STARKNET_SIGNER_TYPE, self.stored_value),
            SignerType::Secp256k1 => poseidon_2(SECP256K1_SIGNER_TYPE, self.stored_value),
            SignerType::Eip191 => poseidon_2(EIP191_SIGNER_TYPE, self.stored_value),
            SignerType::Webauthn => self.stored_value,
            SignerType::Unimplemented => panic!("Unimplemented signer type")
        }
    }

    fn is_stored_as_guid(self: SignerStorageValue) -> bool {
        match self.signer_type {
            SignerType::Starknet => false,
            SignerType::Secp256k1 => false,
            SignerType::Eip191 => false,
            SignerType::Webauthn => true,
            SignerType::Unimplemented => panic!("Unimplemented signer type"),
        }
    }

    #[inline(always)]
    fn starknet_pubkey_or_none(self: SignerStorageValue) -> Option<felt252> {
        match self.signer_type {
            SignerType::Starknet => Option::Some(self.stored_value),
            SignerType::Unimplemented => panic!("Unimplemented signer type"),
            _ => Option::None,
        }
    }
}

#[derive(Drop, Copy, PartialEq, Serde, Default)]
enum SignerType {
    #[default]
    Starknet,
    Secp256k1,
    Eip191,
    Webauthn,
    Unimplemented
}

#[generate_trait]
impl SignerTraitImpl of SignerTrait {
    fn into_guid(self: Signer) -> felt252 {
        match self {
            Signer::Starknet(signer) => poseidon_2(STARKNET_SIGNER_TYPE, signer.pubkey.into()),
            Signer::Secp256k1(signer) => poseidon_2(
                SECP256K1_SIGNER_TYPE, signer.pubkey_hash.address.into()
            ),
            Signer::Eip191(signer) => poseidon_2(
                EIP191_SIGNER_TYPE, signer.eth_address.address.into()
            ),
            Signer::Webauthn(signer) => {
                let mut origin = signer.origin;
                let rp_id_hash: u256 = signer.rp_id_hash.into();
                let pubkey: u256 = signer.pubkey.into();
                let mut hash_state = PoseidonTrait::new()
                    .update_with(WEBAUTHN_SIGNER_TYPE)
                    .update_with(signer.origin.len());

                while let Option::Some(byte) = origin
                    .pop_front() {
                        hash_state = hash_state.update_with(*byte);
                    };
                hash_state.update_with(rp_id_hash).update_with(pubkey).finalize()
            },
            Signer::Unimplemented => 0
        }
    }

    fn storage_value(self: Signer) -> SignerStorageValue {
        match self {
            Signer::Starknet(signer) => SignerStorageValue {
                signer_type: SignerType::Starknet, stored_value: signer.pubkey.into()
            },
            Signer::Secp256k1(signer) => SignerStorageValue {
                signer_type: SignerType::Secp256k1,
                stored_value: signer.pubkey_hash.address.try_into().unwrap()
            },
            Signer::Eip191(signer) => SignerStorageValue {
                signer_type: SignerType::Eip191, stored_value: signer.eth_address.address.try_into().unwrap()
            },
            Signer::Webauthn => SignerStorageValue {
                signer_type: SignerType::Webauthn,
                stored_value: self.into_guid().try_into().unwrap()
            },
            Signer::Unimplemented => SignerStorageValue {
                signer_type: SignerType::Unimplemented, stored_value: 0
            }
        }
    }

    #[inline(always)]
    fn signer_type(self: Signer) -> SignerType {
        match self {
            Signer::Starknet => SignerType::Starknet,
            Signer::Secp256k1 => SignerType::Secp256k1,
            Signer::Eip191 => SignerType::Eip191,
            Signer::Webauthn => SignerType::Webauthn,
            Signer::Unimplemented => SignerType::Unimplemented
        }
    }
}

impl SignerTypeIntoFelt252 of Into<SignerType, felt252> {
    #[inline(always)]
    fn into(self: SignerType) -> felt252 {
        match self {
            SignerType::Starknet => 0,
            SignerType::Secp256k1 => 1,
            SignerType::Webauthn => 4,
            SignerType::Eip191 => 3,
            SignerType::Unimplemented => 999
        }
    }
}
