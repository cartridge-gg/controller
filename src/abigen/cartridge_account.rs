#[derive(Debug)]
pub struct CartridgeAccount<A: starknet::accounts::ConnectedAccount + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub account: A,
    pub block_id: starknet::core::types::BlockId,
}
impl<A: starknet::accounts::ConnectedAccount + Sync> CartridgeAccount<A> {
    pub fn new(address: starknet::core::types::FieldElement, account: A) -> Self {
        Self {
            address,
            account,
            block_id: starknet::core::types::BlockId::Tag(starknet::core::types::BlockTag::Pending),
        }
    }
    pub fn set_contract_address(mut self, address: starknet::core::types::FieldElement) {
        self.address = address;
    }
    pub fn provider(&self) -> &A::Provider {
        self.account.provider()
    }
    pub fn with_block(self, block_id: starknet::core::types::BlockId) -> Self {
        Self { block_id, ..self }
    }
}
#[derive(Debug)]
pub struct CartridgeAccountReader<P: starknet::providers::Provider + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub provider: P,
    pub block_id: starknet::core::types::BlockId,
}
impl<P: starknet::providers::Provider + Sync> CartridgeAccountReader<P> {
    pub fn new(address: starknet::core::types::FieldElement, provider: P) -> Self {
        Self {
            address,
            provider,
            block_id: starknet::core::types::BlockId::Tag(starknet::core::types::BlockTag::Pending),
        }
    }
    pub fn set_contract_address(mut self, address: starknet::core::types::FieldElement) {
        self.address = address;
    }
    pub fn provider(&self) -> &P {
        &self.provider
    }
    pub fn with_block(self, block_id: starknet::core::types::BlockId) -> Self {
        Self { block_id, ..self }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Call {
    pub to: cainome::cairo_serde::ContractAddress,
    pub selector: starknet::core::types::FieldElement,
    pub calldata: Vec<starknet::core::types::FieldElement>,
}
impl cainome::cairo_serde::CairoSerde for Call {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.to);
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.selector);
        __size +=
            Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(&__rust.calldata);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.to,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.selector,
        ));
        __out.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            &__rust.calldata,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let to = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&to);
        let selector = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&selector);
        let calldata =
            Vec::<starknet::core::types::FieldElement>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(&calldata);
        Ok(Call {
            to,
            selector,
            calldata,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Signature {
    pub r: cainome::cairo_serde::U256,
    pub s: cainome::cairo_serde::U256,
    pub y_parity: bool,
}
impl cainome::cairo_serde::CairoSerde for Signature {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::U256::cairo_serialized_size(&__rust.r);
        __size += cainome::cairo_serde::U256::cairo_serialized_size(&__rust.s);
        __size += bool::cairo_serialized_size(&__rust.y_parity);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::U256::cairo_serialize(&__rust.r));
        __out.extend(cainome::cairo_serde::U256::cairo_serialize(&__rust.s));
        __out.extend(bool::cairo_serialize(&__rust.y_parity));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let r = cainome::cairo_serde::U256::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::U256::cairo_serialized_size(&r);
        let s = cainome::cairo_serde::U256::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::U256::cairo_serialized_size(&s);
        let y_parity = bool::cairo_deserialize(__felts, __offset)?;
        __offset += bool::cairo_serialized_size(&y_parity);
        Ok(Signature { r, s, y_parity })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct StarknetSignature {
    pub r: starknet::core::types::FieldElement,
    pub s: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for StarknetSignature {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.r);
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.s);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.r,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.s,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let r = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&r);
        let s = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&s);
        Ok(StarknetSignature { r, s })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct SessionToken {
    pub session: Session,
    pub session_authorization: Vec<starknet::core::types::FieldElement>,
    pub session_signature: SignerSignature,
    pub guardian_signature: SignerSignature,
    pub proofs: Vec<Vec<starknet::core::types::FieldElement>>,
}
impl cainome::cairo_serde::CairoSerde for SessionToken {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += Session::cairo_serialized_size(&__rust.session);
        __size += Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(
            &__rust.session_authorization,
        );
        __size += SignerSignature::cairo_serialized_size(&__rust.session_signature);
        __size += SignerSignature::cairo_serialized_size(&__rust.guardian_signature);
        __size +=
            Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialized_size(&__rust.proofs);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(Session::cairo_serialize(&__rust.session));
        __out.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            &__rust.session_authorization,
        ));
        __out.extend(SignerSignature::cairo_serialize(&__rust.session_signature));
        __out.extend(SignerSignature::cairo_serialize(&__rust.guardian_signature));
        __out.extend(
            Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialize(&__rust.proofs),
        );
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let session = Session::cairo_deserialize(__felts, __offset)?;
        __offset += Session::cairo_serialized_size(&session);
        let session_authorization =
            Vec::<starknet::core::types::FieldElement>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(
            &session_authorization,
        );
        let session_signature = SignerSignature::cairo_deserialize(__felts, __offset)?;
        __offset += SignerSignature::cairo_serialized_size(&session_signature);
        let guardian_signature = SignerSignature::cairo_deserialize(__felts, __offset)?;
        __offset += SignerSignature::cairo_serialized_size(&guardian_signature);
        let proofs =
            Vec::<Vec<starknet::core::types::FieldElement>>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialized_size(&proofs);
        Ok(SessionToken {
            session,
            session_authorization,
            session_signature,
            guardian_signature,
            proofs,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct OwnerAdded {
    pub new_owner_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for OwnerAdded {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_owner_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_owner_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_owner_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_owner_guid);
        Ok(OwnerAdded { new_owner_guid })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct TokenRevoked {
    pub token: Vec<starknet::core::types::FieldElement>,
}
impl cainome::cairo_serde::CairoSerde for TokenRevoked {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(&__rust.token);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            &__rust.token,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let token =
            Vec::<starknet::core::types::FieldElement>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(&token);
        Ok(TokenRevoked { token })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct WebauthnSigner {
    pub origin: Vec<u8>,
    pub rp_id_hash: cainome::cairo_serde::NonZero<cainome::cairo_serde::U256>,
    pub pubkey: cainome::cairo_serde::NonZero<cainome::cairo_serde::U256>,
}
impl cainome::cairo_serde::CairoSerde for WebauthnSigner {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += Vec::<u8>::cairo_serialized_size(&__rust.origin);
        __size +=
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialized_size(
                &__rust.rp_id_hash,
            );
        __size +=
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialized_size(
                &__rust.pubkey,
            );
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(Vec::<u8>::cairo_serialize(&__rust.origin));
        __out.extend(
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialize(
                &__rust.rp_id_hash,
            ),
        );
        __out.extend(
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialize(
                &__rust.pubkey,
            ),
        );
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let origin = Vec::<u8>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<u8>::cairo_serialized_size(&origin);
        let rp_id_hash =
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_deserialize(
                __felts, __offset,
            )?;
        __offset +=
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialized_size(
                &rp_id_hash,
            );
        let pubkey =
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_deserialize(
                __felts, __offset,
            )?;
        __offset +=
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialized_size(
                &pubkey,
            );
        Ok(WebauthnSigner {
            origin,
            rp_id_hash,
            pubkey,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Session {
    pub expires_at: u64,
    pub allowed_methods_root: starknet::core::types::FieldElement,
    pub metadata_hash: starknet::core::types::FieldElement,
    pub session_key_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for Session {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += u64::cairo_serialized_size(&__rust.expires_at);
        __size += starknet::core::types::FieldElement::cairo_serialized_size(
            &__rust.allowed_methods_root,
        );
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.metadata_hash);
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.session_key_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(u64::cairo_serialize(&__rust.expires_at));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.allowed_methods_root,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.metadata_hash,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.session_key_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let expires_at = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&expires_at);
        let allowed_methods_root =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset +=
            starknet::core::types::FieldElement::cairo_serialized_size(&allowed_methods_root);
        let metadata_hash =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&metadata_hash);
        let session_key_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&session_key_guid);
        Ok(Session {
            expires_at,
            allowed_methods_root,
            metadata_hash,
            session_key_guid,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct StarknetSigner {
    pub pubkey: cainome::cairo_serde::NonZero<starknet::core::types::FieldElement>,
}
impl cainome::cairo_serde::CairoSerde for StarknetSigner {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome :: cairo_serde :: NonZero :: < starknet :: core :: types :: FieldElement > :: cairo_serialized_size (& __rust . pubkey) ;
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::NonZero::<
            starknet::core::types::FieldElement,
        >::cairo_serialize(&__rust.pubkey));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let pubkey = cainome :: cairo_serde :: NonZero :: < starknet :: core :: types :: FieldElement > :: cairo_deserialize (__felts , __offset) ? ;
        __offset += cainome :: cairo_serde :: NonZero :: < starknet :: core :: types :: FieldElement > :: cairo_serialized_size (& pubkey) ;
        Ok(StarknetSigner { pubkey })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct OwnerRemoved {
    pub removed_owner_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for OwnerRemoved {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.removed_owner_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.removed_owner_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let removed_owner_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&removed_owner_guid);
        Ok(OwnerRemoved { removed_owner_guid })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct WebauthnAssertion {
    pub authenticator_data: Vec<u8>,
    pub client_data_json: Vec<u8>,
    pub signature: Signature,
    pub type_offset: u32,
    pub challenge_offset: u32,
    pub challenge_length: u32,
    pub origin_offset: u32,
    pub origin_length: u32,
}
impl cainome::cairo_serde::CairoSerde for WebauthnAssertion {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += Vec::<u8>::cairo_serialized_size(&__rust.authenticator_data);
        __size += Vec::<u8>::cairo_serialized_size(&__rust.client_data_json);
        __size += Signature::cairo_serialized_size(&__rust.signature);
        __size += u32::cairo_serialized_size(&__rust.type_offset);
        __size += u32::cairo_serialized_size(&__rust.challenge_offset);
        __size += u32::cairo_serialized_size(&__rust.challenge_length);
        __size += u32::cairo_serialized_size(&__rust.origin_offset);
        __size += u32::cairo_serialized_size(&__rust.origin_length);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(Vec::<u8>::cairo_serialize(&__rust.authenticator_data));
        __out.extend(Vec::<u8>::cairo_serialize(&__rust.client_data_json));
        __out.extend(Signature::cairo_serialize(&__rust.signature));
        __out.extend(u32::cairo_serialize(&__rust.type_offset));
        __out.extend(u32::cairo_serialize(&__rust.challenge_offset));
        __out.extend(u32::cairo_serialize(&__rust.challenge_length));
        __out.extend(u32::cairo_serialize(&__rust.origin_offset));
        __out.extend(u32::cairo_serialize(&__rust.origin_length));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let authenticator_data = Vec::<u8>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<u8>::cairo_serialized_size(&authenticator_data);
        let client_data_json = Vec::<u8>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<u8>::cairo_serialized_size(&client_data_json);
        let signature = Signature::cairo_deserialize(__felts, __offset)?;
        __offset += Signature::cairo_serialized_size(&signature);
        let type_offset = u32::cairo_deserialize(__felts, __offset)?;
        __offset += u32::cairo_serialized_size(&type_offset);
        let challenge_offset = u32::cairo_deserialize(__felts, __offset)?;
        __offset += u32::cairo_serialized_size(&challenge_offset);
        let challenge_length = u32::cairo_deserialize(__felts, __offset)?;
        __offset += u32::cairo_serialized_size(&challenge_length);
        let origin_offset = u32::cairo_deserialize(__felts, __offset)?;
        __offset += u32::cairo_serialized_size(&origin_offset);
        let origin_length = u32::cairo_deserialize(__felts, __offset)?;
        __offset += u32::cairo_serialized_size(&origin_length);
        Ok(WebauthnAssertion {
            authenticator_data,
            client_data_json,
            signature,
            type_offset,
            challenge_offset,
            challenge_length,
            origin_offset,
            origin_length,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum SignerType {
    Starknet,
    Webauthn,
    Unimplemented,
}
impl cainome::cairo_serde::CairoSerde for SignerType {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            SignerType::Starknet => 1,
            SignerType::Webauthn => 1,
            SignerType::Unimplemented => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SignerType::Starknet => usize::cairo_serialize(&0usize),
            SignerType::Webauthn => usize::cairo_serialize(&1usize),
            SignerType::Unimplemented => usize::cairo_serialize(&2usize),
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(SignerType::Starknet),
            1usize => Ok(SignerType::Webauthn),
            2usize => Ok(SignerType::Unimplemented),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SignerType"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum Event {
    OwnerAdded(OwnerAdded),
    OwnerRemoved(OwnerRemoved),
    SessionEvent(SessionComponentEvent),
}
impl cainome::cairo_serde::CairoSerde for Event {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            Event::OwnerAdded(val) => OwnerAdded::cairo_serialized_size(val) + 1,
            Event::OwnerRemoved(val) => OwnerRemoved::cairo_serialized_size(val) + 1,
            Event::SessionEvent(val) => SessionComponentEvent::cairo_serialized_size(val) + 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            Event::OwnerAdded(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(OwnerAdded::cairo_serialize(val));
                temp
            }
            Event::OwnerRemoved(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(OwnerRemoved::cairo_serialize(val));
                temp
            }
            Event::SessionEvent(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(SessionComponentEvent::cairo_serialize(val));
                temp
            }
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(Event::OwnerAdded(OwnerAdded::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            1usize => Ok(Event::OwnerRemoved(OwnerRemoved::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            2usize => Ok(Event::SessionEvent(
                SessionComponentEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "Event"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for Event {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnerAdded")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnerAdded"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_owner_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner_guid", "OwnerAdded", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_owner_guid);
            return Ok(Event::OwnerAdded(OwnerAdded { new_owner_guid }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnerRemoved")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnerRemoved"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let removed_owner_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "removed_owner_guid", "OwnerRemoved", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&removed_owner_guid);
            return Ok(Event::OwnerRemoved(OwnerRemoved { removed_owner_guid }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("SessionEvent")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "SessionEvent"))
        {
            let selector = event.keys[1];
            if selector
                == starknet::core::utils::get_selector_from_name("TokenRevoked")
                    .unwrap_or_else(|_| panic!("Invalid selector for {}", "TokenRevoked"))
            {
                let mut key_offset = 1 + 1;
                let mut data_offset = 0;
                let token = match Vec::<starknet::core::types::FieldElement>::cairo_deserialize(
                    &event.data,
                    data_offset,
                ) {
                    Ok(v) => v,
                    Err(e) => {
                        return Err(format!(
                            "Could not deserialize field {} for {}: {:?}",
                            "token", "TokenRevoked", e
                        ))
                    }
                };
                data_offset +=
                    Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(&token);
                return Ok(Event::SessionEvent(SessionComponentEvent::TokenRevoked(
                    TokenRevoked { token },
                )));
            };
        }
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum SessionComponentEvent {
    TokenRevoked(TokenRevoked),
}
impl cainome::cairo_serde::CairoSerde for SessionComponentEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            SessionComponentEvent::TokenRevoked(val) => {
                TokenRevoked::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SessionComponentEvent::TokenRevoked(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(TokenRevoked::cairo_serialize(val));
                temp
            }
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(SessionComponentEvent::TokenRevoked(
                TokenRevoked::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SessionComponentEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for SessionComponentEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("TokenRevoked")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "TokenRevoked"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let token = match Vec::<starknet::core::types::FieldElement>::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "token", "TokenRevoked", e
                    ))
                }
            };
            data_offset +=
                Vec::<starknet::core::types::FieldElement>::cairo_serialized_size(&token);
            return Ok(SessionComponentEvent::TokenRevoked(TokenRevoked { token }));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum Signer {
    Starknet(StarknetSigner),
    Webauthn(WebauthnSigner),
    Unimplemented,
}
impl cainome::cairo_serde::CairoSerde for Signer {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            Signer::Starknet(val) => StarknetSigner::cairo_serialized_size(val) + 1,
            Signer::Webauthn(val) => WebauthnSigner::cairo_serialized_size(val) + 1,
            Signer::Unimplemented => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            Signer::Starknet(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(StarknetSigner::cairo_serialize(val));
                temp
            }
            Signer::Webauthn(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(WebauthnSigner::cairo_serialize(val));
                temp
            }
            Signer::Unimplemented => usize::cairo_serialize(&2usize),
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(Signer::Starknet(StarknetSigner::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            1usize => Ok(Signer::Webauthn(WebauthnSigner::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            2usize => Ok(Signer::Unimplemented),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "Signer"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum SignerSignature {
    Starknet((StarknetSigner, StarknetSignature)),
    Webauthn((WebauthnSigner, WebauthnAssertion)),
    Unimplemented,
}
impl cainome::cairo_serde::CairoSerde for SignerSignature {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            SignerSignature::Starknet(val) => {
                <(StarknetSigner, StarknetSignature)>::cairo_serialized_size(val) + 1
            }
            SignerSignature::Webauthn(val) => {
                <(WebauthnSigner, WebauthnAssertion)>::cairo_serialized_size(val) + 1
            }
            SignerSignature::Unimplemented => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SignerSignature::Starknet(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(<(StarknetSigner, StarknetSignature)>::cairo_serialize(val));
                temp
            }
            SignerSignature::Webauthn(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(<(WebauthnSigner, WebauthnAssertion)>::cairo_serialize(val));
                temp
            }
            SignerSignature::Unimplemented => usize::cairo_serialize(&2usize),
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(SignerSignature::Starknet(<(
                StarknetSigner,
                StarknetSignature,
            )>::cairo_deserialize(
                __felts, __offset + 1
            )?)),
            1usize => Ok(SignerSignature::Webauthn(<(
                WebauthnSigner,
                WebauthnAssertion,
            )>::cairo_deserialize(
                __felts, __offset + 1
            )?)),
            2usize => Ok(SignerSignature::Unimplemented),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SignerSignature"
                )))
            }
        }
    }
}
impl<A: starknet::accounts::ConnectedAccount + Sync> CartridgeAccount<A> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __validate_declare__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("__validate_declare__"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn abi_method(
        &self,
        signature: &SignerSignature,
        signer_type: &SignerType,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(SignerSignature::cairo_serialize(signature));
        __calldata.extend(SignerType::cairo_serialize(signer_type));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("abi_method"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_owner(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_owner"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_owner_type(&self) -> cainome::cairo_serde::call::FCall<A::Provider, SignerType> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_owner_type"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn is_valid_signature(
        &self,
        hash: &starknet::core::types::FieldElement,
        signature: &Vec<starknet::core::types::FieldElement>,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(hash));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signature,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_valid_signature"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __validate_deploy__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
        contract_address_salt: &starknet::core::types::FieldElement,
        public_key: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            contract_address_salt,
        ));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            public_key,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("__validate_deploy__"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn validate_session(
        &self,
        signature: &SessionToken,
        calls: &Vec<Call>,
        transaction_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(SessionToken::cairo_serialize(signature));
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            transaction_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("validate_session"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn validate_session_serialized(
        &self,
        signature: &Vec<starknet::core::types::FieldElement>,
        calls: &Vec<Call>,
        transaction_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signature,
        ));
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            transaction_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("validate_session_serialized"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn compute_proof(
        &self,
        calls: &Vec<Call>,
        position: &u64,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, Vec<starknet::core::types::FieldElement>>
    {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        __calldata.extend(u64::cairo_serialize(position));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("compute_proof"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn compute_root(
        &self,
        call: &Call,
        proof: &Vec<starknet::core::types::FieldElement>,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Call::cairo_serialize(call));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            proof,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("compute_root"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn compute_session_hash(
        &self,
        unsigned_signature: &Session,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Session::cairo_serialize(unsigned_signature));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("compute_session_hash"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __validate___getcall(&self, calls: &Vec<Call>) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("__validate__"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn __validate__(&self, calls: &Vec<Call>) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("__validate__"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __execute___getcall(&self, calls: &Vec<Call>) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("__execute__"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn __execute__(&self, calls: &Vec<Call>) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("__execute__"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn revoke_session_getcall(
        &self,
        token: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            token,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("revoke_session"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn revoke_session(
        &self,
        token: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            token,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("revoke_session"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
}
impl<P: starknet::providers::Provider + Sync> CartridgeAccountReader<P> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __validate_declare__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("__validate_declare__"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn abi_method(
        &self,
        signature: &SignerSignature,
        signer_type: &SignerType,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(SignerSignature::cairo_serialize(signature));
        __calldata.extend(SignerType::cairo_serialize(signer_type));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("abi_method"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_owner(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_owner"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_owner_type(&self) -> cainome::cairo_serde::call::FCall<P, SignerType> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_owner_type"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn is_valid_signature(
        &self,
        hash: &starknet::core::types::FieldElement,
        signature: &Vec<starknet::core::types::FieldElement>,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(hash));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signature,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_valid_signature"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __validate_deploy__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
        contract_address_salt: &starknet::core::types::FieldElement,
        public_key: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            contract_address_salt,
        ));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            public_key,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("__validate_deploy__"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn validate_session(
        &self,
        signature: &SessionToken,
        calls: &Vec<Call>,
        transaction_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(SessionToken::cairo_serialize(signature));
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            transaction_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("validate_session"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn validate_session_serialized(
        &self,
        signature: &Vec<starknet::core::types::FieldElement>,
        calls: &Vec<Call>,
        transaction_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signature,
        ));
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            transaction_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("validate_session_serialized"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn compute_proof(
        &self,
        calls: &Vec<Call>,
        position: &u64,
    ) -> cainome::cairo_serde::call::FCall<P, Vec<starknet::core::types::FieldElement>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<Call>::cairo_serialize(calls));
        __calldata.extend(u64::cairo_serialize(position));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("compute_proof"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn compute_root(
        &self,
        call: &Call,
        proof: &Vec<starknet::core::types::FieldElement>,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Call::cairo_serialize(call));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            proof,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("compute_root"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn compute_session_hash(
        &self,
        unsigned_signature: &Session,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Session::cairo_serialize(unsigned_signature));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("compute_session_hash"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
}
