#[derive(Debug)]
pub struct ArgentAccount<A: starknet::accounts::ConnectedAccount + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub account: A,
    pub block_id: starknet::core::types::BlockId,
}
impl<A: starknet::accounts::ConnectedAccount + Sync> ArgentAccount<A> {
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
pub struct ArgentAccountReader<P: starknet::providers::Provider + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub provider: P,
    pub block_id: starknet::core::types::BlockId,
}
impl<P: starknet::providers::Provider + Sync> ArgentAccountReader<P> {
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
pub struct EscapeOwnerTriggeredGuid {
    pub ready_at: u64,
    pub new_owner_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for EscapeOwnerTriggeredGuid {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += u64::cairo_serialized_size(&__rust.ready_at);
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_owner_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(u64::cairo_serialize(&__rust.ready_at));
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
        let ready_at = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&ready_at);
        let new_owner_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_owner_guid);
        Ok(EscapeOwnerTriggeredGuid {
            ready_at,
            new_owner_guid,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct AccountCreated {
    pub owner: starknet::core::types::FieldElement,
    pub guardian: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for AccountCreated {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.owner);
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.guardian);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.owner,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.guardian,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let owner = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&owner);
        let guardian = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&guardian);
        Ok(AccountCreated { owner, guardian })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Eip191Signer {
    pub eth_address: cainome::cairo_serde::EthAddress,
}
impl cainome::cairo_serde::CairoSerde for Eip191Signer {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::EthAddress::cairo_serialized_size(&__rust.eth_address);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::EthAddress::cairo_serialize(
            &__rust.eth_address,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let eth_address = cainome::cairo_serde::EthAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::EthAddress::cairo_serialized_size(&eth_address);
        Ok(Eip191Signer { eth_address })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct AccountCreatedGuid {
    pub owner_guid: starknet::core::types::FieldElement,
    pub guardian_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for AccountCreatedGuid {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.owner_guid);
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.guardian_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.owner_guid,
        ));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.guardian_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let owner_guid = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&owner_guid);
        let guardian_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&guardian_guid);
        Ok(AccountCreatedGuid {
            owner_guid,
            guardian_guid,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct OwnerEscapedGuid {
    pub new_owner_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for OwnerEscapedGuid {
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
        Ok(OwnerEscapedGuid { new_owner_guid })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct GuardianChangedGuid {
    pub new_guardian_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for GuardianChangedGuid {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_guardian_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_guardian_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_guardian_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_guid);
        Ok(GuardianChangedGuid { new_guardian_guid })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct GuardianChanged {
    pub new_guardian: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for GuardianChanged {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_guardian);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_guardian,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_guardian =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian);
        Ok(GuardianChanged { new_guardian })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct EscapeCanceled {}
impl cainome::cairo_serde::CairoSerde for EscapeCanceled {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        Ok(EscapeCanceled {})
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Version {
    pub major: u8,
    pub minor: u8,
    pub patch: u8,
}
impl cainome::cairo_serde::CairoSerde for Version {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += u8::cairo_serialized_size(&__rust.major);
        __size += u8::cairo_serialized_size(&__rust.minor);
        __size += u8::cairo_serialized_size(&__rust.patch);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(u8::cairo_serialize(&__rust.major));
        __out.extend(u8::cairo_serialize(&__rust.minor));
        __out.extend(u8::cairo_serialize(&__rust.patch));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let major = u8::cairo_deserialize(__felts, __offset)?;
        __offset += u8::cairo_serialized_size(&major);
        let minor = u8::cairo_deserialize(__felts, __offset)?;
        __offset += u8::cairo_serialized_size(&minor);
        let patch = u8::cairo_deserialize(__felts, __offset)?;
        __offset += u8::cairo_serialized_size(&patch);
        Ok(Version {
            major,
            minor,
            patch,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone)]
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
pub struct LegacyEscape {
    pub ready_at: u64,
    pub escape_type: LegacyEscapeType,
    pub new_signer: Option<SignerStorageValue>,
}
impl cainome::cairo_serde::CairoSerde for LegacyEscape {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += u64::cairo_serialized_size(&__rust.ready_at);
        __size += LegacyEscapeType::cairo_serialized_size(&__rust.escape_type);
        __size += Option::<SignerStorageValue>::cairo_serialized_size(&__rust.new_signer);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(u64::cairo_serialize(&__rust.ready_at));
        __out.extend(LegacyEscapeType::cairo_serialize(&__rust.escape_type));
        __out.extend(Option::<SignerStorageValue>::cairo_serialize(
            &__rust.new_signer,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let ready_at = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&ready_at);
        let escape_type = LegacyEscapeType::cairo_deserialize(__felts, __offset)?;
        __offset += LegacyEscapeType::cairo_serialized_size(&escape_type);
        let new_signer = Option::<SignerStorageValue>::cairo_deserialize(__felts, __offset)?;
        __offset += Option::<SignerStorageValue>::cairo_serialized_size(&new_signer);
        Ok(LegacyEscape {
            ready_at,
            escape_type,
            new_signer,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct TransactionExecuted {
    pub hash: starknet::core::types::FieldElement,
    pub response: Vec<Vec<starknet::core::types::FieldElement>>,
}
impl cainome::cairo_serde::CairoSerde for TransactionExecuted {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.hash);
        __size += Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialized_size(
            &__rust.response,
        );
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.hash,
        ));
        __out.extend(
            Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialize(&__rust.response),
        );
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let hash = starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&hash);
        let response =
            Vec::<Vec<starknet::core::types::FieldElement>>::cairo_deserialize(__felts, __offset)?;
        __offset +=
            Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialized_size(&response);
        Ok(TransactionExecuted { hash, response })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Secp256r1Signer {
    pub pubkey: cainome::cairo_serde::NonZero<cainome::cairo_serde::U256>,
}
impl cainome::cairo_serde::CairoSerde for Secp256r1Signer {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialized_size(
                &__rust.pubkey,
            );
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
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
        let pubkey =
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_deserialize(
                __felts, __offset,
            )?;
        __offset +=
            cainome::cairo_serde::NonZero::<cainome::cairo_serde::U256>::cairo_serialized_size(
                &pubkey,
            );
        Ok(Secp256r1Signer { pubkey })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct GuardianEscapedGuid {
    pub new_guardian_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for GuardianEscapedGuid {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_guardian_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_guardian_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_guardian_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_guid);
        Ok(GuardianEscapedGuid { new_guardian_guid })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct AccountUpgraded {
    pub new_implementation: cainome::cairo_serde::ClassHash,
}
impl cainome::cairo_serde::CairoSerde for AccountUpgraded {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            cainome::cairo_serde::ClassHash::cairo_serialized_size(&__rust.new_implementation);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            &__rust.new_implementation,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_implementation =
            cainome::cairo_serde::ClassHash::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ClassHash::cairo_serialized_size(&new_implementation);
        Ok(AccountUpgraded { new_implementation })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct EscapeGuardianTriggeredGuid {
    pub ready_at: u64,
    pub new_guardian_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for EscapeGuardianTriggeredGuid {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += u64::cairo_serialized_size(&__rust.ready_at);
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_guardian_guid);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(u64::cairo_serialize(&__rust.ready_at));
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_guardian_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let ready_at = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&ready_at);
        let new_guardian_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_guid);
        Ok(EscapeGuardianTriggeredGuid {
            ready_at,
            new_guardian_guid,
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
pub struct SignerStorageValue {
    pub stored_value: starknet::core::types::FieldElement,
    pub signer_type: SignerType,
}
impl cainome::cairo_serde::CairoSerde for SignerStorageValue {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(&__rust.stored_value);
        __size += SignerType::cairo_serialized_size(&__rust.signer_type);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.stored_value,
        ));
        __out.extend(SignerType::cairo_serialize(&__rust.signer_type));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let stored_value =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset += starknet::core::types::FieldElement::cairo_serialized_size(&stored_value);
        let signer_type = SignerType::cairo_deserialize(__felts, __offset)?;
        __offset += SignerType::cairo_serialized_size(&signer_type);
        Ok(SignerStorageValue {
            stored_value,
            signer_type,
        })
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
pub struct GuardianBackupChangedGuid {
    pub new_guardian_backup_guid: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for GuardianBackupChangedGuid {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += starknet::core::types::FieldElement::cairo_serialized_size(
            &__rust.new_guardian_backup_guid,
        );
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_guardian_backup_guid,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_guardian_backup_guid =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset +=
            starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_backup_guid);
        Ok(GuardianBackupChangedGuid {
            new_guardian_backup_guid,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct EscapeSecurityPeriodChanged {
    pub escape_security_period: u64,
}
impl cainome::cairo_serde::CairoSerde for EscapeSecurityPeriodChanged {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += u64::cairo_serialized_size(&__rust.escape_security_period);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(u64::cairo_serialize(&__rust.escape_security_period));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let escape_security_period = u64::cairo_deserialize(__felts, __offset)?;
        __offset += u64::cairo_serialized_size(&escape_security_period);
        Ok(EscapeSecurityPeriodChanged {
            escape_security_period,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
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
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct GuardianBackupChanged {
    pub new_guardian_backup: starknet::core::types::FieldElement,
}
impl cainome::cairo_serde::CairoSerde for GuardianBackupChanged {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            starknet::core::types::FieldElement::cairo_serialized_size(&__rust.new_guardian_backup);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(starknet::core::types::FieldElement::cairo_serialize(
            &__rust.new_guardian_backup,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let new_guardian_backup =
            starknet::core::types::FieldElement::cairo_deserialize(__felts, __offset)?;
        __offset +=
            starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_backup);
        Ok(GuardianBackupChanged {
            new_guardian_backup,
        })
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
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum SignerSignature {
    Starknet((StarknetSigner, StarknetSignature)),
    Secp256k1((Secp256k1Signer, Signature)),
    Secp256r1((Secp256r1Signer, Signature)),
    Eip191((Eip191Signer, Signature)),
    Webauthn((WebauthnSigner, WebauthnAssertion)),
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
            SignerSignature::Secp256r1(val) => {
                <(Secp256r1Signer, Signature)>::cairo_serialized_size(val) + 1
            }
            SignerSignature::Eip191(val) => {
                <(Eip191Signer, Signature)>::cairo_serialized_size(val) + 1
            }
            SignerSignature::Webauthn(val) => {
                <(WebauthnSigner, WebauthnAssertion)>::cairo_serialized_size(val) + 1
            }
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
            SignerSignature::Secp256r1(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(<(Secp256r1Signer, Signature)>::cairo_serialize(val));
                temp
            }
            SignerSignature::Eip191(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&3usize));
                temp.extend(<(Eip191Signer, Signature)>::cairo_serialize(val));
                temp
            }
            SignerSignature::Webauthn(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&4usize));
                temp.extend(<(WebauthnSigner, WebauthnAssertion)>::cairo_serialize(val));
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
            0usize => Ok(SignerSignature::Starknet(<(
                StarknetSigner,
                StarknetSignature,
            )>::cairo_deserialize(
                __felts, __offset + 1
            )?)),
            1usize => Ok(SignerSignature::Secp256k1(
                <(Secp256k1Signer, Signature)>::cairo_deserialize(__felts, __offset + 1)?,
            )),
            2usize => Ok(SignerSignature::Secp256r1(
                <(Secp256r1Signer, Signature)>::cairo_deserialize(__felts, __offset + 1)?,
            )),
            3usize => Ok(SignerSignature::Eip191(
                <(Eip191Signer, Signature)>::cairo_deserialize(__felts, __offset + 1)?,
            )),
            4usize => Ok(SignerSignature::Webauthn(<(
                WebauthnSigner,
                WebauthnAssertion,
            )>::cairo_deserialize(
                __felts, __offset + 1
            )?)),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "SignerSignature"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum EscapeStatus {
    None,
    NotReady,
    Ready,
    Expired,
}
impl cainome::cairo_serde::CairoSerde for EscapeStatus {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            EscapeStatus::None => 1,
            EscapeStatus::NotReady => 1,
            EscapeStatus::Ready => 1,
            EscapeStatus::Expired => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            EscapeStatus::None => usize::cairo_serialize(&0usize),
            EscapeStatus::NotReady => usize::cairo_serialize(&1usize),
            EscapeStatus::Ready => usize::cairo_serialize(&2usize),
            EscapeStatus::Expired => usize::cairo_serialize(&3usize),
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(EscapeStatus::None),
            1usize => Ok(EscapeStatus::NotReady),
            2usize => Ok(EscapeStatus::Ready),
            3usize => Ok(EscapeStatus::Expired),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "EscapeStatus"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum SignerType {
    Starknet,
    Secp256k1,
    Secp256r1,
    Eip191,
    Webauthn,
}
impl cainome::cairo_serde::CairoSerde for SignerType {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            SignerType::Starknet => 1,
            SignerType::Secp256k1 => 1,
            SignerType::Secp256r1 => 1,
            SignerType::Eip191 => 1,
            SignerType::Webauthn => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SignerType::Starknet => usize::cairo_serialize(&0usize),
            SignerType::Secp256k1 => usize::cairo_serialize(&1usize),
            SignerType::Secp256r1 => usize::cairo_serialize(&2usize),
            SignerType::Eip191 => usize::cairo_serialize(&3usize),
            SignerType::Webauthn => usize::cairo_serialize(&4usize),
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
            2usize => Ok(SignerType::Secp256r1),
            3usize => Ok(SignerType::Eip191),
            4usize => Ok(SignerType::Webauthn),
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
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum LegacyEscapeType {
    None,
    Guardian,
    Owner,
}
impl cainome::cairo_serde::CairoSerde for LegacyEscapeType {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            LegacyEscapeType::None => 1,
            LegacyEscapeType::Guardian => 1,
            LegacyEscapeType::Owner => 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            LegacyEscapeType::None => usize::cairo_serialize(&0usize),
            LegacyEscapeType::Guardian => usize::cairo_serialize(&1usize),
            LegacyEscapeType::Owner => usize::cairo_serialize(&2usize),
            _ => vec![],
        }
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let __index: u128 = __felts[__offset].try_into().unwrap();
        match __index as usize {
            0usize => Ok(LegacyEscapeType::None),
            1usize => Ok(LegacyEscapeType::Guardian),
            2usize => Ok(LegacyEscapeType::Owner),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "LegacyEscapeType"
                )))
            }
        }
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum Event {
    ExecuteFromOutsideEvents(OutsideExecutionEvent),
    SRC5Events(Src5ComponentEvent),
    UpgradeEvents(UpgradeComponentEvent),
    SessionableEvents(SessionComponentEvent),
    TransactionExecuted(TransactionExecuted),
    AccountCreated(AccountCreated),
    AccountCreatedGuid(AccountCreatedGuid),
    EscapeOwnerTriggeredGuid(EscapeOwnerTriggeredGuid),
    EscapeGuardianTriggeredGuid(EscapeGuardianTriggeredGuid),
    OwnerEscapedGuid(OwnerEscapedGuid),
    GuardianEscapedGuid(GuardianEscapedGuid),
    EscapeCanceled(EscapeCanceled),
    OwnerChanged(OwnerChanged),
    OwnerChangedGuid(OwnerChangedGuid),
    GuardianChanged(GuardianChanged),
    GuardianChangedGuid(GuardianChangedGuid),
    GuardianBackupChanged(GuardianBackupChanged),
    GuardianBackupChangedGuid(GuardianBackupChangedGuid),
    SignerLinked(SignerLinked),
    EscapeSecurityPeriodChanged(EscapeSecurityPeriodChanged),
}
impl cainome::cairo_serde::CairoSerde for Event {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            Event::ExecuteFromOutsideEvents(val) => {
                OutsideExecutionEvent::cairo_serialized_size(val) + 1
            }
            Event::SRC5Events(val) => Src5ComponentEvent::cairo_serialized_size(val) + 1,
            Event::UpgradeEvents(val) => UpgradeComponentEvent::cairo_serialized_size(val) + 1,
            Event::SessionableEvents(val) => SessionComponentEvent::cairo_serialized_size(val) + 1,
            Event::TransactionExecuted(val) => TransactionExecuted::cairo_serialized_size(val) + 1,
            Event::AccountCreated(val) => AccountCreated::cairo_serialized_size(val) + 1,
            Event::AccountCreatedGuid(val) => AccountCreatedGuid::cairo_serialized_size(val) + 1,
            Event::EscapeOwnerTriggeredGuid(val) => {
                EscapeOwnerTriggeredGuid::cairo_serialized_size(val) + 1
            }
            Event::EscapeGuardianTriggeredGuid(val) => {
                EscapeGuardianTriggeredGuid::cairo_serialized_size(val) + 1
            }
            Event::OwnerEscapedGuid(val) => OwnerEscapedGuid::cairo_serialized_size(val) + 1,
            Event::GuardianEscapedGuid(val) => GuardianEscapedGuid::cairo_serialized_size(val) + 1,
            Event::EscapeCanceled(val) => EscapeCanceled::cairo_serialized_size(val) + 1,
            Event::OwnerChanged(val) => OwnerChanged::cairo_serialized_size(val) + 1,
            Event::OwnerChangedGuid(val) => OwnerChangedGuid::cairo_serialized_size(val) + 1,
            Event::GuardianChanged(val) => GuardianChanged::cairo_serialized_size(val) + 1,
            Event::GuardianChangedGuid(val) => GuardianChangedGuid::cairo_serialized_size(val) + 1,
            Event::GuardianBackupChanged(val) => {
                GuardianBackupChanged::cairo_serialized_size(val) + 1
            }
            Event::GuardianBackupChangedGuid(val) => {
                GuardianBackupChangedGuid::cairo_serialized_size(val) + 1
            }
            Event::SignerLinked(val) => SignerLinked::cairo_serialized_size(val) + 1,
            Event::EscapeSecurityPeriodChanged(val) => {
                EscapeSecurityPeriodChanged::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            Event::ExecuteFromOutsideEvents(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(OutsideExecutionEvent::cairo_serialize(val));
                temp
            }
            Event::SRC5Events(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(Src5ComponentEvent::cairo_serialize(val));
                temp
            }
            Event::UpgradeEvents(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(UpgradeComponentEvent::cairo_serialize(val));
                temp
            }
            Event::SessionableEvents(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&3usize));
                temp.extend(SessionComponentEvent::cairo_serialize(val));
                temp
            }
            Event::TransactionExecuted(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&4usize));
                temp.extend(TransactionExecuted::cairo_serialize(val));
                temp
            }
            Event::AccountCreated(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&5usize));
                temp.extend(AccountCreated::cairo_serialize(val));
                temp
            }
            Event::AccountCreatedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&6usize));
                temp.extend(AccountCreatedGuid::cairo_serialize(val));
                temp
            }
            Event::EscapeOwnerTriggeredGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&7usize));
                temp.extend(EscapeOwnerTriggeredGuid::cairo_serialize(val));
                temp
            }
            Event::EscapeGuardianTriggeredGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&8usize));
                temp.extend(EscapeGuardianTriggeredGuid::cairo_serialize(val));
                temp
            }
            Event::OwnerEscapedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&9usize));
                temp.extend(OwnerEscapedGuid::cairo_serialize(val));
                temp
            }
            Event::GuardianEscapedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&10usize));
                temp.extend(GuardianEscapedGuid::cairo_serialize(val));
                temp
            }
            Event::EscapeCanceled(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&11usize));
                temp.extend(EscapeCanceled::cairo_serialize(val));
                temp
            }
            Event::OwnerChanged(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&12usize));
                temp.extend(OwnerChanged::cairo_serialize(val));
                temp
            }
            Event::OwnerChangedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&13usize));
                temp.extend(OwnerChangedGuid::cairo_serialize(val));
                temp
            }
            Event::GuardianChanged(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&14usize));
                temp.extend(GuardianChanged::cairo_serialize(val));
                temp
            }
            Event::GuardianChangedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&15usize));
                temp.extend(GuardianChangedGuid::cairo_serialize(val));
                temp
            }
            Event::GuardianBackupChanged(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&16usize));
                temp.extend(GuardianBackupChanged::cairo_serialize(val));
                temp
            }
            Event::GuardianBackupChangedGuid(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&17usize));
                temp.extend(GuardianBackupChangedGuid::cairo_serialize(val));
                temp
            }
            Event::SignerLinked(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&18usize));
                temp.extend(SignerLinked::cairo_serialize(val));
                temp
            }
            Event::EscapeSecurityPeriodChanged(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&19usize));
                temp.extend(EscapeSecurityPeriodChanged::cairo_serialize(val));
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
            0usize => Ok(Event::ExecuteFromOutsideEvents(
                OutsideExecutionEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            1usize => Ok(Event::SRC5Events(Src5ComponentEvent::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            2usize => Ok(Event::UpgradeEvents(
                UpgradeComponentEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            3usize => Ok(Event::SessionableEvents(
                SessionComponentEvent::cairo_deserialize(__felts, __offset + 1)?,
            )),
            4usize => Ok(Event::TransactionExecuted(
                TransactionExecuted::cairo_deserialize(__felts, __offset + 1)?,
            )),
            5usize => Ok(Event::AccountCreated(AccountCreated::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            6usize => Ok(Event::AccountCreatedGuid(
                AccountCreatedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            7usize => Ok(Event::EscapeOwnerTriggeredGuid(
                EscapeOwnerTriggeredGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            8usize => Ok(Event::EscapeGuardianTriggeredGuid(
                EscapeGuardianTriggeredGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            9usize => Ok(Event::OwnerEscapedGuid(
                OwnerEscapedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            10usize => Ok(Event::GuardianEscapedGuid(
                GuardianEscapedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            11usize => Ok(Event::EscapeCanceled(EscapeCanceled::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            12usize => Ok(Event::OwnerChanged(OwnerChanged::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            13usize => Ok(Event::OwnerChangedGuid(
                OwnerChangedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            14usize => Ok(Event::GuardianChanged(GuardianChanged::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            15usize => Ok(Event::GuardianChangedGuid(
                GuardianChangedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            16usize => Ok(Event::GuardianBackupChanged(
                GuardianBackupChanged::cairo_deserialize(__felts, __offset + 1)?,
            )),
            17usize => Ok(Event::GuardianBackupChangedGuid(
                GuardianBackupChangedGuid::cairo_deserialize(__felts, __offset + 1)?,
            )),
            18usize => Ok(Event::SignerLinked(SignerLinked::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            19usize => Ok(Event::EscapeSecurityPeriodChanged(
                EscapeSecurityPeriodChanged::cairo_deserialize(__felts, __offset + 1)?,
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
            == starknet::core::utils::get_selector_from_name("AccountUpgraded")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "AccountUpgraded"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_implementation = match cainome::cairo_serde::ClassHash::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_implementation", "AccountUpgraded", e
                    ))
                }
            };
            data_offset +=
                cainome::cairo_serde::ClassHash::cairo_serialized_size(&new_implementation);
            return Ok(Event::UpgradeEvents(
                UpgradeComponentEvent::AccountUpgraded(AccountUpgraded { new_implementation }),
            ));
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
            return Ok(Event::SessionableEvents(
                SessionComponentEvent::SessionRevoked(SessionRevoked { session_hash }),
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("TransactionExecuted")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "TransactionExecuted"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let hash = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "hash", "TransactionExecuted", e
                    ))
                }
            };
            key_offset += starknet::core::types::FieldElement::cairo_serialized_size(&hash);
            let response = match Vec::<Vec<starknet::core::types::FieldElement>>::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "response", "TransactionExecuted", e
                    ))
                }
            };
            data_offset +=
                Vec::<Vec<starknet::core::types::FieldElement>>::cairo_serialized_size(&response);
            return Ok(Event::TransactionExecuted(TransactionExecuted {
                hash,
                response,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("AccountCreated")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "AccountCreated"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let owner = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "owner", "AccountCreated", e
                    ))
                }
            };
            key_offset += starknet::core::types::FieldElement::cairo_serialized_size(&owner);
            let guardian = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "guardian", "AccountCreated", e
                    ))
                }
            };
            data_offset += starknet::core::types::FieldElement::cairo_serialized_size(&guardian);
            return Ok(Event::AccountCreated(AccountCreated { owner, guardian }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("AccountCreatedGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "AccountCreatedGuid"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let owner_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "owner_guid", "AccountCreatedGuid", e
                    ))
                }
            };
            key_offset += starknet::core::types::FieldElement::cairo_serialized_size(&owner_guid);
            let guardian_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "guardian_guid", "AccountCreatedGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&guardian_guid);
            return Ok(Event::AccountCreatedGuid(AccountCreatedGuid {
                owner_guid,
                guardian_guid,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("EscapeOwnerTriggeredGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "EscapeOwnerTriggeredGuid"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let ready_at = match u64::cairo_deserialize(&event.data, data_offset) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "ready_at", "EscapeOwnerTriggeredGuid", e
                    ))
                }
            };
            data_offset += u64::cairo_serialized_size(&ready_at);
            let new_owner_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner_guid", "EscapeOwnerTriggeredGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_owner_guid);
            return Ok(Event::EscapeOwnerTriggeredGuid(EscapeOwnerTriggeredGuid {
                ready_at,
                new_owner_guid,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("EscapeGuardianTriggeredGuid")
                .unwrap_or_else(|_| {
                    panic!("Invalid selector for {}", "EscapeGuardianTriggeredGuid")
                })
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let ready_at = match u64::cairo_deserialize(&event.data, data_offset) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "ready_at", "EscapeGuardianTriggeredGuid", e
                    ))
                }
            };
            data_offset += u64::cairo_serialized_size(&ready_at);
            let new_guardian_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_guardian_guid", "EscapeGuardianTriggeredGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_guid);
            return Ok(Event::EscapeGuardianTriggeredGuid(
                EscapeGuardianTriggeredGuid {
                    ready_at,
                    new_guardian_guid,
                },
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnerEscapedGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnerEscapedGuid"))
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
                        "new_owner_guid", "OwnerEscapedGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_owner_guid);
            return Ok(Event::OwnerEscapedGuid(OwnerEscapedGuid { new_owner_guid }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("GuardianEscapedGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "GuardianEscapedGuid"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_guardian_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_guardian_guid", "GuardianEscapedGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_guid);
            return Ok(Event::GuardianEscapedGuid(GuardianEscapedGuid {
                new_guardian_guid,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("EscapeCanceled")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "EscapeCanceled"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            return Ok(Event::EscapeCanceled(EscapeCanceled {}));
        };
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
            == starknet::core::utils::get_selector_from_name("GuardianChanged")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "GuardianChanged"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_guardian = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_guardian", "GuardianChanged", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian);
            return Ok(Event::GuardianChanged(GuardianChanged { new_guardian }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("GuardianChangedGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "GuardianChangedGuid"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_guardian_guid = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_guardian_guid", "GuardianChangedGuid", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_guid);
            return Ok(Event::GuardianChangedGuid(GuardianChangedGuid {
                new_guardian_guid,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("GuardianBackupChanged")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "GuardianBackupChanged"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_guardian_backup = match starknet::core::types::FieldElement::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_guardian_backup", "GuardianBackupChanged", e
                    ))
                }
            };
            data_offset +=
                starknet::core::types::FieldElement::cairo_serialized_size(&new_guardian_backup);
            return Ok(Event::GuardianBackupChanged(GuardianBackupChanged {
                new_guardian_backup,
            }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("GuardianBackupChangedGuid")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "GuardianBackupChangedGuid"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_guardian_backup_guid =
                match starknet::core::types::FieldElement::cairo_deserialize(
                    &event.data,
                    data_offset,
                ) {
                    Ok(v) => v,
                    Err(e) => {
                        return Err(format!(
                            "Could not deserialize field {} for {}: {:?}",
                            "new_guardian_backup_guid", "GuardianBackupChangedGuid", e
                        ))
                    }
                };
            data_offset += starknet::core::types::FieldElement::cairo_serialized_size(
                &new_guardian_backup_guid,
            );
            return Ok(Event::GuardianBackupChangedGuid(
                GuardianBackupChangedGuid {
                    new_guardian_backup_guid,
                },
            ));
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
            == starknet::core::utils::get_selector_from_name("EscapeSecurityPeriodChanged")
                .unwrap_or_else(|_| {
                    panic!("Invalid selector for {}", "EscapeSecurityPeriodChanged")
                })
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let escape_security_period = match u64::cairo_deserialize(&event.data, data_offset) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "escape_security_period", "EscapeSecurityPeriodChanged", e
                    ))
                }
            };
            data_offset += u64::cairo_serialized_size(&escape_security_period);
            return Ok(Event::EscapeSecurityPeriodChanged(
                EscapeSecurityPeriodChanged {
                    escape_security_period,
                },
            ));
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
    Secp256k1(Secp256k1Signer),
    Secp256r1(Secp256r1Signer),
    Eip191(Eip191Signer),
    Webauthn(WebauthnSigner),
}
impl cainome::cairo_serde::CairoSerde for Signer {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            Signer::Starknet(val) => StarknetSigner::cairo_serialized_size(val) + 1,
            Signer::Secp256k1(val) => Secp256k1Signer::cairo_serialized_size(val) + 1,
            Signer::Secp256r1(val) => Secp256r1Signer::cairo_serialized_size(val) + 1,
            Signer::Eip191(val) => Eip191Signer::cairo_serialized_size(val) + 1,
            Signer::Webauthn(val) => WebauthnSigner::cairo_serialized_size(val) + 1,
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
            Signer::Secp256r1(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&2usize));
                temp.extend(Secp256r1Signer::cairo_serialize(val));
                temp
            }
            Signer::Eip191(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&3usize));
                temp.extend(Eip191Signer::cairo_serialize(val));
                temp
            }
            Signer::Webauthn(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&4usize));
                temp.extend(WebauthnSigner::cairo_serialize(val));
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
            0usize => Ok(Signer::Starknet(StarknetSigner::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            1usize => Ok(Signer::Secp256k1(Secp256k1Signer::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            2usize => Ok(Signer::Secp256r1(Secp256r1Signer::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            3usize => Ok(Signer::Eip191(Eip191Signer::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            4usize => Ok(Signer::Webauthn(WebauthnSigner::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
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
pub enum UpgradeComponentEvent {
    AccountUpgraded(AccountUpgraded),
}
impl cainome::cairo_serde::CairoSerde for UpgradeComponentEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            UpgradeComponentEvent::AccountUpgraded(val) => {
                AccountUpgraded::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            UpgradeComponentEvent::AccountUpgraded(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(AccountUpgraded::cairo_serialize(val));
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
            0usize => Ok(UpgradeComponentEvent::AccountUpgraded(
                AccountUpgraded::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "UpgradeComponentEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for UpgradeComponentEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("AccountUpgraded")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "AccountUpgraded"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let new_implementation = match cainome::cairo_serde::ClassHash::cairo_deserialize(
                &event.data,
                data_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_implementation", "AccountUpgraded", e
                    ))
                }
            };
            data_offset +=
                cainome::cairo_serde::ClassHash::cairo_serialized_size(&new_implementation);
            return Ok(UpgradeComponentEvent::AccountUpgraded(AccountUpgraded {
                new_implementation,
            }));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum SessionComponentEvent {
    SessionRevoked(SessionRevoked),
}
impl cainome::cairo_serde::CairoSerde for SessionComponentEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            SessionComponentEvent::SessionRevoked(val) => {
                SessionRevoked::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            SessionComponentEvent::SessionRevoked(val) => {
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
            0usize => Ok(SessionComponentEvent::SessionRevoked(
                SessionRevoked::cairo_deserialize(__felts, __offset + 1)?,
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
            return Ok(SessionComponentEvent::SessionRevoked(SessionRevoked {
                session_hash,
            }));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
impl<A: starknet::accounts::ConnectedAccount + Sync> ArgentAccount<A> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn getVersion(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("getVersion"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn getName(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("getName"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn isValidSignature(
        &self,
        hash: &starknet::core::types::FieldElement,
        signatures: &Vec<starknet::core::types::FieldElement>,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(hash));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signatures,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("isValidSignature"),
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
    pub fn supportsInterface(
        &self,
        interfaceId: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            interfaceId,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("supportsInterface"),
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
    pub fn get_outside_execution_message_hash_rev_0(
        &self,
        outside_execution: &OutsideExecution,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(OutsideExecution::cairo_serialize(outside_execution));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!(
                "get_outside_execution_message_hash_rev_0"
            ),
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
    pub fn __validate_deploy__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
        contract_address_salt: &starknet::core::types::FieldElement,
        owner: &Signer,
        guardian: &Option<Signer>,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            contract_address_salt,
        ));
        __calldata.extend(Signer::cairo_serialize(owner));
        __calldata.extend(Option::<Signer>::cairo_serialize(guardian));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("__validate_deploy__"),
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
    pub fn get_owner_guid(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_owner_guid"),
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
    pub fn get_guardian(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn is_guardian(
        &self,
        guardian: &Signer,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Signer::cairo_serialize(guardian));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_guardian"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_guid(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_guid"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_type(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_type"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_backup(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_backup"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_backup_guid(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_backup_guid"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_backup_type(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_backup_type"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_escape(&self) -> cainome::cairo_serde::call::FCall<A::Provider, LegacyEscape> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_escape"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_name(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_name"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_version(&self) -> cainome::cairo_serde::call::FCall<A::Provider, Version> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_version"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_last_owner_escape_attempt(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, u64> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_last_owner_escape_attempt"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_last_guardian_escape_attempt(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, u64> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_last_guardian_escape_attempt"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_escape_and_status(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, (LegacyEscape, EscapeStatus)> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_escape_and_status"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_escape_security_period(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, u64> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_escape_security_period"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
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
    pub fn perform_upgrade_getcall(
        &self,
        new_implementation: &cainome::cairo_serde::ClassHash,
        data: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            new_implementation,
        ));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            data,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("perform_upgrade"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn perform_upgrade(
        &self,
        new_implementation: &cainome::cairo_serde::ClassHash,
        data: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            new_implementation,
        ));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            data,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("perform_upgrade"),
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
    pub fn execute_from_outside_getcall(
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
            selector: starknet::macros::selector!("execute_from_outside"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn execute_from_outside(
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
            selector: starknet::macros::selector!("execute_from_outside"),
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
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn set_escape_security_period_getcall(
        &self,
        new_security_period: &u64,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(u64::cairo_serialize(new_security_period));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("set_escape_security_period"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn set_escape_security_period(
        &self,
        new_security_period: &u64,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(u64::cairo_serialize(new_security_period));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("set_escape_security_period"),
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
    pub fn change_guardian_getcall(
        &self,
        new_guardian: &Option<Signer>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Option::<Signer>::cairo_serialize(new_guardian));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("change_guardian"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn change_guardian(
        &self,
        new_guardian: &Option<Signer>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Option::<Signer>::cairo_serialize(new_guardian));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("change_guardian"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn change_guardian_backup_getcall(
        &self,
        new_guardian_backup: &Option<Signer>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Option::<Signer>::cairo_serialize(new_guardian_backup));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("change_guardian_backup"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn change_guardian_backup(
        &self,
        new_guardian_backup: &Option<Signer>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Option::<Signer>::cairo_serialize(new_guardian_backup));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("change_guardian_backup"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn trigger_escape_owner_getcall(&self, new_owner: &Signer) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Signer::cairo_serialize(new_owner));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("trigger_escape_owner"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn trigger_escape_owner(&self, new_owner: &Signer) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Signer::cairo_serialize(new_owner));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("trigger_escape_owner"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn trigger_escape_guardian_getcall(
        &self,
        new_guardian: &Option<Signer>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Option::<Signer>::cairo_serialize(new_guardian));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("trigger_escape_guardian"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn trigger_escape_guardian(
        &self,
        new_guardian: &Option<Signer>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Option::<Signer>::cairo_serialize(new_guardian));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("trigger_escape_guardian"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn escape_owner_getcall(&self) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("escape_owner"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn escape_owner(&self) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("escape_owner"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn escape_guardian_getcall(&self) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("escape_guardian"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn escape_guardian(&self) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("escape_guardian"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn cancel_escape_getcall(&self) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("cancel_escape"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn cancel_escape(&self) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("cancel_escape"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn execute_after_upgrade_getcall(
        &self,
        data: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            data,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("execute_after_upgrade"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn execute_after_upgrade(
        &self,
        data: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            data,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("execute_after_upgrade"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn upgrade_getcall(
        &self,
        new_implementation: &cainome::cairo_serde::ClassHash,
        data: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            new_implementation,
        ));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            data,
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
        new_implementation: &cainome::cairo_serde::ClassHash,
        data: &Vec<starknet::core::types::FieldElement>,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ClassHash::cairo_serialize(
            new_implementation,
        ));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            data,
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
}
impl<P: starknet::providers::Provider + Sync> ArgentAccountReader<P> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn getVersion(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("getVersion"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn getName(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("getName"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn isValidSignature(
        &self,
        hash: &starknet::core::types::FieldElement,
        signatures: &Vec<starknet::core::types::FieldElement>,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(hash));
        __calldata.extend(Vec::<starknet::core::types::FieldElement>::cairo_serialize(
            signatures,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("isValidSignature"),
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
    pub fn supportsInterface(
        &self,
        interfaceId: &starknet::core::types::FieldElement,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            interfaceId,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("supportsInterface"),
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
    pub fn get_outside_execution_message_hash_rev_0(
        &self,
        outside_execution: &OutsideExecution,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(OutsideExecution::cairo_serialize(outside_execution));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!(
                "get_outside_execution_message_hash_rev_0"
            ),
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
    pub fn __validate_deploy__(
        &self,
        class_hash: &starknet::core::types::FieldElement,
        contract_address_salt: &starknet::core::types::FieldElement,
        owner: &Signer,
        guardian: &Option<Signer>,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            class_hash,
        ));
        __calldata.extend(starknet::core::types::FieldElement::cairo_serialize(
            contract_address_salt,
        ));
        __calldata.extend(Signer::cairo_serialize(owner));
        __calldata.extend(Option::<Signer>::cairo_serialize(guardian));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("__validate_deploy__"),
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
    pub fn get_owner_guid(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_owner_guid"),
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
    pub fn get_guardian(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn is_guardian(&self, guardian: &Signer) -> cainome::cairo_serde::call::FCall<P, bool> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(Signer::cairo_serialize(guardian));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("is_guardian"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_guid(&self) -> cainome::cairo_serde::call::FCall<P, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_guid"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_type(&self) -> cainome::cairo_serde::call::FCall<P, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_type"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_backup(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_backup"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_backup_guid(&self) -> cainome::cairo_serde::call::FCall<P, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_backup_guid"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_guardian_backup_type(&self) -> cainome::cairo_serde::call::FCall<P, Option<Signer>> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_guardian_backup_type"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_escape(&self) -> cainome::cairo_serde::call::FCall<P, LegacyEscape> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_escape"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_name(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, starknet::core::types::FieldElement> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_name"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_version(&self) -> cainome::cairo_serde::call::FCall<P, Version> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_version"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_last_owner_escape_attempt(&self) -> cainome::cairo_serde::call::FCall<P, u64> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_last_owner_escape_attempt"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_last_guardian_escape_attempt(&self) -> cainome::cairo_serde::call::FCall<P, u64> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_last_guardian_escape_attempt"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_escape_and_status(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, (LegacyEscape, EscapeStatus)> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_escape_and_status"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn get_escape_security_period(&self) -> cainome::cairo_serde::call::FCall<P, u64> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("get_escape_security_period"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
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
}
