#[derive(Debug)]
pub struct Controller<A: starknet::accounts::ConnectedAccount + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub account: A,
    pub block_id: starknet::core::types::BlockId,
}
impl<A: starknet::accounts::ConnectedAccount + Sync> Controller<A> {
    pub fn new(address: starknet::core::types::FieldElement, account: A) -> Self {
        Self {
            address,
            account,
            block_id: starknet::core::types::BlockId::Tag(starknet::core::types::BlockTag::Pending),
        }
    }
    pub fn set_contract_address(&mut self, address: starknet::core::types::FieldElement) {
        self.address = address;
    }
    pub fn provider(&self) -> &A::Provider {
        self.account.provider()
    }
    pub fn set_block(&mut self, block_id: starknet::core::types::BlockId) {
        self.block_id = block_id;
    }
    pub fn with_block(self, block_id: starknet::core::types::BlockId) -> Self {
        Self { block_id, ..self }
    }
}
#[derive(Debug)]
pub struct ControllerReader<P: starknet::providers::Provider + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub provider: P,
    pub block_id: starknet::core::types::BlockId,
}
impl<P: starknet::providers::Provider + Sync> ControllerReader<P> {
    pub fn new(address: starknet::core::types::FieldElement, provider: P) -> Self {
        Self {
            address,
            provider,
            block_id: starknet::core::types::BlockId::Tag(starknet::core::types::BlockTag::Pending),
        }
    }
    pub fn set_contract_address(&mut self, address: starknet::core::types::FieldElement) {
        self.address = address;
    }
    pub fn provider(&self) -> &P {
        &self.provider
    }
    pub fn set_block(&mut self, block_id: starknet::core::types::BlockId) {
        self.block_id = block_id;
    }
    pub fn with_block(self, block_id: starknet::core::types::BlockId) -> Self {
        Self { block_id, ..self }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct ExternalOwnerRemoved {
    pub address: cainome::cairo_serde::ContractAddress,
}
impl cainome::cairo_serde::CairoSerde for ExternalOwnerRemoved {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.address);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.address,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let address = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
        Ok(ExternalOwnerRemoved { address })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct OwnerChanged {
    pub new_owner: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for OwnerChanged {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_owner);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_owner,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_owner = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_owner);
        Ok(OwnerChanged { new_owner })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct OwnerChangedGuid {
    pub new_owner_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for OwnerChangedGuid {
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
        Ok(OwnerChangedGuid { new_owner_guid })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct SignerLinked {
    pub signer_guid: starknet::core::types::FieldElement,
    pub signer: Signer,
}
impl cainome::cairo_serde::CairoSerde for SignerLinked {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.signer_guid);
        __size += Signer::cairo_serialized_size(&__rust.signer);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.signer_guid,
        ));
        __out.extend(Signer::cairo_serialize(&__rust.signer));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let signer_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&signer_guid);
        let signer = Signer::cairo_deserialize(__felts, __offset)?;
        __offset += Signer::cairo_serialized_size(&signer);
        Ok(SignerLinked {
            signer_guid,
            signer,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct DelegateAccountChanged {
    pub address: cainome::cairo_serde::ContractAddress,
}
impl cainome::cairo_serde::CairoSerde for DelegateAccountChanged {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.address);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.address,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let address = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
        Ok(DelegateAccountChanged { address })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct SessionRevoked {
    pub session_hash: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for SessionRevoked {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.session_hash);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.session_hash,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let session_hash =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&session_hash);
        Ok(SessionRevoked { session_hash })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct OutsideExecution {
    pub caller: cainome::cairo_serde::ContractAddress,
    pub nonce: starknet::core::types::FieldElement,
    pub execute_after: u64,
    pub execute_before: u64,
    pub calls: Vec<Call>,
}
impl cainome::cairo_serde::CairoSerde for OutsideExecution {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.caller);
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.nonce);
        __size += u64::cairo_serialized_size(&__rust.execute_after);
        __size += u64::cairo_serialized_size(&__rust.execute_before);
        __size += Vec::<Call>::cairo_serialized_size(&__rust.calls);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.caller,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.nonce,
        ));
        __out.extend(u64::cairo_serialize(&__rust.execute_after));
        __out.extend(u64::cairo_serialize(&__rust.execute_before));
        __out.extend(Vec::<Call>::cairo_serialize(&__rust.calls));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let caller = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&caller);
        let nonce = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&nonce);
        let execute_after = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&execute_after);
        let execute_before = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&execute_before);
        let calls = Vec::<Call>::cairo_deserialize(__felts, __offset)?;
        __offset += Vec::<Call>::cairo_serialized_size(&calls);
        Ok(OutsideExecution {
            caller,
            nonce,
            execute_after,
            execute_before,
            calls,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct Secp256k1Signer {
    pub pubkey_hash: cainome::cairo_serde::EthAddress,
}
impl cainome::cairo_serde::CairoSerde for Secp256k1Signer {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::EthAddress::cairo_serialized_size(&__rust.pubkey_hash);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::EthAddress::cairo_serialize(
            &__rust.pubkey_hash,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let pubkey_hash = cainome::cairo_serde::EthAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::EthAddress::cairo_serialized_size(&pubkey_hash);
        Ok(Secp256k1Signer { pubkey_hash })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct Upgraded {
    pub class_hash: cainome::cairo_serde::ClassHash,
}
impl cainome::cairo_serde::CairoSerde for Upgraded {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ClassHash::cairo_serialized_size(&__rust.class_hash);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            &__rust.class_hash,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let class_hash = cainome::cairo_serde::ClassHash::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ClassHash::cairo_serialized_size(&class_hash);
        Ok(Upgraded { class_hash })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub struct ExternalOwnerRegistered {
    pub address: cainome::cairo_serde::ContractAddress,
}
impl cainome::cairo_serde::CairoSerde for ExternalOwnerRegistered {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.address);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.address,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let address = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
        Ok(ExternalOwnerRegistered { address })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum SignerSignature {
    Starknet((StarknetSigner, StarknetSignature)),
    Secp256k1((Secp256k1Signer, Signature)),
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
            SignerSignature::Secp256k1(val) => {
                <(Secp256k1Signer, Signature)>::cairo_serialized_size(val) + 1
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
            SignerSignature::Secp256k1(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(<(Secp256k1Signer, Signature)>::cairo_serialize(val));
                temp
            }
            SignerSignature::Webauthn(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(<(WebauthnSigner, WebauthnAssertion)>::cairo_serialize(val));
                temp
            }
            SignerSignature::Unimplemented => usize::cairo_serialize(&3usize),
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
            1usize => Ok(SignerSignature::Secp256k1(
                <(Secp256k1Signer, Signature)>::cairo_deserialize(__felts, __offset + 1)?,
            )),
            2usize => Ok(SignerSignature::Webauthn(<(
                WebauthnSigner,
                WebauthnAssertion,
            )>::cairo_deserialize(
                __felts, __offset + 1
            )?)),
            3usize => Ok(SignerSignature::Unimplemented),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SignerSignature"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum Event {
    OwnerChanged(OwnerChanged),
    OwnerChangedGuid(OwnerChangedGuid),
    SignerLinked(SignerLinked),
    SessionEvent(SessionEvent),
    ExternalOwnersEvent(ExternalOwnersEvent),
    ExecuteFromOutsideEvents(OutsideExecutionEvent),
    DelegateAccountEvents(DelegateAccountEvent),
    SRC5Events(Src5ComponentEvent),
    UpgradeableEvent(UpgradeEvent),
}
impl cainome::cairo_serde::CairoSerde for Event {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            Event::OwnerChanged(val) => OwnerChanged::cairo_serialized_size(val) + 1,
            Event::OwnerChangedGuid(val) => OwnerChangedGuid::cairo_serialized_size(val) + 1,
            Event::SignerLinked(val) => SignerLinked::cairo_serialized_size(val) + 1,
            Event::SessionEvent(val) => SessionEvent::cairo_serialized_size(val) + 1,
            Event::ExternalOwnersEvent(val) => ExternalOwnersEvent::cairo_serialized_size(val) + 1,
            Event::ExecuteFromOutsideEvents(val) => {
                OutsideExecutionEvent::cairo_serialized_size(val) + 1
            }
            Event::DelegateAccountEvents(val) => {
                DelegateAccountEvent::cairo_serialized_size(val) + 1
            }
            Event::SRC5Events(val) => Src5ComponentEvent::cairo_serialized_size(val) + 1,
            Event::UpgradeableEvent(val) => UpgradeEvent::cairo_serialized_size(val) + 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            Event::OwnerChanged(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(OwnerChanged::cairo_serialize(val));
                temp
            }
            Event::OwnerChangedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(OwnerChangedGuid::cairo_serialize(val));
                temp
            }
            Event::SignerLinked(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(SignerLinked::cairo_serialize(val));
                temp
            }
            Event::SessionEvent(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&3usize));
                temp.extend(SessionEvent::cairo_serialize(val));
                temp
            }
            Event::ExternalOwnersEvent(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&4usize));
                temp.extend(ExternalOwnersEvent::cairo_serialize(val));
                temp
            }
            Event::ExecuteFromOutsideEvents(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&5usize));
                temp.extend(OutsideExecutionEvent::cairo_serialize(val));
                temp
            }
            Event::DelegateAccountEvents(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&6usize));
                temp.extend(DelegateAccountEvent::cairo_serialize(val));
                temp
            }
            Event::SRC5Events(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&7usize));
                temp.extend(Src5ComponentEvent::cairo_serialize(val));
                temp
            }
            Event::UpgradeableEvent(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&8usize));
                temp.extend(UpgradeEvent::cairo_serialize(val));
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
            0usize => Ok(Event::OwnerChanged(OwnerChanged::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            1usize => Ok(Event::OwnerChangedGuid(
                OwnerChangedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            2usize => Ok(Event::SignerLinked(SignerLinked::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            3usize => Ok(Event::SessionEvent(SessionEvent::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            4usize => Ok(Event::ExternalOwnersEvent(
                ExternalOwnersEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            5usize => Ok(Event::ExecuteFromOutsideEvents(
                OutsideExecutionEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            6usize => Ok(Event::DelegateAccountEvents(
                DelegateAccountEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            7usize => Ok(Event::SRC5Events(Src5ComponentEvent::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            8usize => Ok(Event::UpgradeableEvent(UpgradeEvent::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
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
            == starknet::core::utils::get_selector_from_name("OwnerChanged")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnerChanged"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_owner = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner", "OwnerChanged", e
                    ))
                }
            };
            data_offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_owner);
            return Ok(Event::OwnerChanged(OwnerChanged { new_owner }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnerChangedGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnerChangedGuid"))
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
                        "new_owner_guid", "OwnerChangedGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_owner_guid);
            return Ok(Event::OwnerChangedGuid(OwnerChangedGuid { new_owner_guid }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("SignerLinked")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "SignerLinked"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let signer_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "signer_guid", "SignerLinked", e
                    ))
                }
            };
            key_offset += starknet::core::types::FieldElement::cairo_serialized_size(&signer_guid);
            let signer = match Signer::cairo_deserialize(&event.data, data_offset) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "signer", "SignerLinked", e
                    ))
                }
            };
            data_offset += Signer::cairo_serialized_size(&signer);
            return Ok(Event::SignerLinked(SignerLinked {
                signer_guid,
                signer,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("SessionRevoked")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "SessionRevoked"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let session_hash = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "session_hash", "SessionRevoked", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&session_hash);
            return Ok(Event::SessionEvent(SessionEvent::SessionRevoked(
                SessionRevoked { session_hash },
            )));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("ExternalOwnerRegistered")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "ExternalOwnerRegistered"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let address = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "address", "ExternalOwnerRegistered", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
            return Ok(Event::ExternalOwnersEvent(
                ExternalOwnersEvent::ExternalOwnerRegistered(ExternalOwnerRegistered { address }),
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("ExternalOwnerRemoved")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "ExternalOwnerRemoved"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let address = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "address", "ExternalOwnerRemoved", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
            return Ok(Event::ExternalOwnersEvent(
                ExternalOwnersEvent::ExternalOwnerRemoved(ExternalOwnerRemoved { address }),
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("DelegateAccountChanged")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "DelegateAccountChanged"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let address = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "address", "DelegateAccountChanged", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
            return Ok(Event::DelegateAccountEvents(
                DelegateAccountEvent::DelegateAccountChanged(DelegateAccountChanged { address }),
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("Upgraded")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "Upgraded"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let class_hash = match cainome::cairo_serde::ClassHash::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "class_hash", "Upgraded", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ClassHash::cairo_serialized_size(&class_hash);
            return Ok(Event::UpgradeableEvent(UpgradeEvent::Upgraded(Upgraded {
                class_hash,
            })));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum ExternalOwnersEvent {
    ExternalOwnerRegistered(ExternalOwnerRegistered),
    ExternalOwnerRemoved(ExternalOwnerRemoved),
}
impl cainome::cairo_serde::CairoSerde for ExternalOwnersEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            ExternalOwnersEvent::ExternalOwnerRegistered(val) => {
                ExternalOwnerRegistered::cairo_serialized_size(val) + 1
            }
            ExternalOwnersEvent::ExternalOwnerRemoved(val) => {
                ExternalOwnerRemoved::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            ExternalOwnersEvent::ExternalOwnerRegistered(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(ExternalOwnerRegistered::cairo_serialize(val));
                temp
            }
            ExternalOwnersEvent::ExternalOwnerRemoved(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(ExternalOwnerRemoved::cairo_serialize(val));
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
            0usize => Ok(ExternalOwnersEvent::ExternalOwnerRegistered(
                ExternalOwnerRegistered::cairo_deserialize(__felts, __offset + 1)?,
            )),
            1usize => Ok(ExternalOwnersEvent::ExternalOwnerRemoved(
                ExternalOwnerRemoved::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "ExternalOwnersEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for ExternalOwnersEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("ExternalOwnerRegistered")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "ExternalOwnerRegistered"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let address = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "address", "ExternalOwnerRegistered", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
            return Ok(ExternalOwnersEvent::ExternalOwnerRegistered(
                ExternalOwnerRegistered { address },
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("ExternalOwnerRemoved")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "ExternalOwnerRemoved"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let address = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "address", "ExternalOwnerRemoved", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
            return Ok(ExternalOwnersEvent::ExternalOwnerRemoved(
                ExternalOwnerRemoved { address },
            ));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum Src5ComponentEvent {}
impl cainome::cairo_serde::CairoSerde for Src5ComponentEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "Src5ComponentEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for Src5ComponentEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum SessionEvent {
    SessionRevoked(SessionRevoked),
}
impl cainome::cairo_serde::CairoSerde for SessionEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            SessionEvent::SessionRevoked(val) => SessionRevoked::cairo_serialized_size(val) + 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SessionEvent::SessionRevoked(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(SessionRevoked::cairo_serialize(val));
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
            0usize => Ok(SessionEvent::SessionRevoked(
                SessionRevoked::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SessionEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for SessionEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("SessionRevoked")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "SessionRevoked"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let session_hash = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "session_hash", "SessionRevoked", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&session_hash);
            return Ok(SessionEvent::SessionRevoked(SessionRevoked {
                session_hash,
            }));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum UpgradeEvent {
    Upgraded(Upgraded),
}
impl cainome::cairo_serde::CairoSerde for UpgradeEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            UpgradeEvent::Upgraded(val) => Upgraded::cairo_serialized_size(val) + 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            UpgradeEvent::Upgraded(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(Upgraded::cairo_serialize(val));
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
            0usize => Ok(UpgradeEvent::Upgraded(Upgraded::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "UpgradeEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for UpgradeEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("Upgraded")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "Upgraded"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let class_hash = match cainome::cairo_serde::ClassHash::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "class_hash", "Upgraded", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ClassHash::cairo_serialized_size(&class_hash);
            return Ok(UpgradeEvent::Upgraded(Upgraded { class_hash }));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum Signer {
    Starknet(StarknetSigner),
    Secp256k1(Secp256k1Signer),
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
            Signer::Secp256k1(val) => Secp256k1Signer::cairo_serialized_size(val) + 1,
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
            Signer::Secp256k1(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(Secp256k1Signer::cairo_serialize(val));
                temp
            }
            Signer::Webauthn(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(WebauthnSigner::cairo_serialize(val));
                temp
            }
            Signer::Unimplemented => usize::cairo_serialize(&3usize),
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
            1usize => Ok(Signer::Secp256k1(Secp256k1Signer::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            2usize => Ok(Signer::Webauthn(WebauthnSigner::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            3usize => Ok(Signer::Unimplemented),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "Signer"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum SignerType {
    Starknet,
    Secp256k1,
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
            SignerType::Secp256k1 => 1,
            SignerType::Webauthn => 1,
            SignerType::Unimplemented => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SignerType::Starknet => usize::cairo_serialize(&0usize),
            SignerType::Secp256k1 => usize::cairo_serialize(&1usize),
            SignerType::Webauthn => usize::cairo_serialize(&2usize),
            SignerType::Unimplemented => usize::cairo_serialize(&3usize),
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
            1usize => Ok(SignerType::Secp256k1),
            2usize => Ok(SignerType::Webauthn),
            3usize => Ok(SignerType::Unimplemented),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SignerType"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum DelegateAccountEvent {
    DelegateAccountChanged(DelegateAccountChanged),
}
impl cainome::cairo_serde::CairoSerde for DelegateAccountEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            DelegateAccountEvent::DelegateAccountChanged(val) => {
                DelegateAccountChanged::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            DelegateAccountEvent::DelegateAccountChanged(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(DelegateAccountChanged::cairo_serialize(val));
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
            0usize => Ok(DelegateAccountEvent::DelegateAccountChanged(
                DelegateAccountChanged::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "DelegateAccountEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for DelegateAccountEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("DelegateAccountChanged")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "DelegateAccountChanged"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let address = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "address", "DelegateAccountChanged", e
                    ))
                }
            };
            data_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&address);
            return Ok(DelegateAccountEvent::DelegateAccountChanged(
                DelegateAccountChanged { address },
            ));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone, serde :: Serialize, serde :: Deserialize)]
pub enum OutsideExecutionEvent {}
impl cainome::cairo_serde::CairoSerde for OutsideExecutionEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "OutsideExecutionEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for OutsideExecutionEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
impl<A: starknet::accounts::ConnectedAccount + Sync> Controller<A> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn supports_interface(
        &self,
        interface_id: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            interface_id,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("supports_interface"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn is_registered_external_owner(
        &self,
        external_owner_address: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            external_owner_address,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_registered_external_owner"),
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
    pub fn is_session_revoked(
        &self,
        session_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            session_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_session_revoked"),
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
    pub fn delegate_account(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::ContractAddress> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("delegate_account"),
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
    pub fn is_valid_outside_execution_nonce(
        &self,
        nonce: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(nonce));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_valid_outside_execution_nonce"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_outside_execution_message_hash_rev_1(
        &self,
        outside_execution: &OutsideExecution,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(OutsideExecution::cairo_serialize(outside_execution));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!(
                "get_outside_execution_message_hash_rev_1"
            ),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn register_external_owner_getcall(
        &self,
        external_owner_address: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            external_owner_address,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("register_external_owner"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn register_external_owner(
        &self,
        external_owner_address: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            external_owner_address,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("register_external_owner"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn remove_external_owner_getcall(
        &self,
        external_owner_address: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            external_owner_address,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("remove_external_owner"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn remove_external_owner(
        &self,
        external_owner_address: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            external_owner_address,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("remove_external_owner"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn __validate_declare___getcall(
        &self,
        class_hash: &starknet::core::types::FieldElement,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("__validate_declare__"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn __validate_declare__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("__validate_declare__"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn upgrade_getcall(
        &self,
        new_class_hash: &cainome::cairo_serde::ClassHash,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            new_class_hash,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("upgrade"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn upgrade(
        &self,
        new_class_hash: &cainome::cairo_serde::ClassHash,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            new_class_hash,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("upgrade"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
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
        session_hash: &starknet::core::types::FieldElement,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            session_hash,
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
        session_hash: &starknet::core::types::FieldElement,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            session_hash,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("revoke_session"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn register_session_getcall(&self, session: &Session) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Session::cairo_serialize(session));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("register_session"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn register_session(&self, session: &Session) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Session::cairo_serialize(session));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("register_session"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn set_delegate_account_getcall(
        &self,
        delegate_address: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            delegate_address,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("set_delegate_account"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn set_delegate_account(
        &self,
        delegate_address: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            delegate_address,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("set_delegate_account"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn change_owner_getcall(
        &self,
        signer_signature: &SignerSignature,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(SignerSignature::cairo_serialize(signer_signature));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("change_owner"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn change_owner(
        &self,
        signer_signature: &SignerSignature,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(SignerSignature::cairo_serialize(signer_signature));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("change_owner"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn execute_from_outside_v2_getcall(
        &self,
        outside_execution: &OutsideExecution,
        signature: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(OutsideExecution::cairo_serialize(outside_execution));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signature,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("execute_from_outside_v2"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn execute_from_outside_v2(
        &self,
        outside_execution: &OutsideExecution,
        signature: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(OutsideExecution::cairo_serialize(outside_execution));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signature,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("execute_from_outside_v2"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
}
impl<P: starknet::providers::Provider + Sync> ControllerReader<P> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn supports_interface(
        &self,
        interface_id: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            interface_id,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("supports_interface"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn is_registered_external_owner(
        &self,
        external_owner_address: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<P, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            external_owner_address,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_registered_external_owner"),
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
    pub fn is_session_revoked(
        &self,
        session_hash: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            session_hash,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_session_revoked"),
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
    pub fn delegate_account(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::ContractAddress> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("delegate_account"),
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
    pub fn is_valid_outside_execution_nonce(
        &self,
        nonce: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(nonce));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_valid_outside_execution_nonce"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_outside_execution_message_hash_rev_1(
        &self,
        outside_execution: &OutsideExecution,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(OutsideExecution::cairo_serialize(outside_execution));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!(
                "get_outside_execution_message_hash_rev_1"
            ),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
}
