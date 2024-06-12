#[derive(Debug)]
pub struct Erc20<A: starknet::accounts::ConnectedAccount + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub account: A,
    pub block_id: starknet::core::types::BlockId,
}
impl<A: starknet::accounts::ConnectedAccount + Sync> Erc20<A> {
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
pub struct Erc20Reader<P: starknet::providers::Provider + Sync> {
    pub address: starknet::core::types::FieldElement,
    pub provider: P,
    pub block_id: starknet::core::types::BlockId,
}
impl<P: starknet::providers::Provider + Sync> Erc20Reader<P> {
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
pub struct Approval {
    pub owner: cainome::cairo_serde::ContractAddress,
    pub spender: cainome::cairo_serde::ContractAddress,
    pub value: cainome::cairo_serde::U256,
}
impl cainome::cairo_serde::CairoSerde for Approval {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.owner);
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.spender);
        __size += cainome::cairo_serde::U256::cairo_serialized_size(&__rust.value);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.owner,
        ));
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.spender,
        ));
        __out.extend(cainome::cairo_serde::U256::cairo_serialize(&__rust.value));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let owner = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&owner);
        let spender = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&spender);
        let value = cainome::cairo_serde::U256::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::U256::cairo_serialized_size(&value);
        Ok(Approval {
            owner,
            spender,
            value,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct OwnershipTransferred {
    pub previous_owner: cainome::cairo_serde::ContractAddress,
    pub new_owner: cainome::cairo_serde::ContractAddress,
}
impl cainome::cairo_serde::CairoSerde for OwnershipTransferred {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.previous_owner);
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.new_owner);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.previous_owner,
        ));
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.new_owner,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let previous_owner =
            cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&previous_owner);
        let new_owner =
            cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&new_owner);
        Ok(OwnershipTransferred {
            previous_owner,
            new_owner,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct Transfer {
    pub from: cainome::cairo_serde::ContractAddress,
    pub to: cainome::cairo_serde::ContractAddress,
    pub value: cainome::cairo_serde::U256,
}
impl cainome::cairo_serde::CairoSerde for Transfer {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.from);
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.to);
        __size += cainome::cairo_serde::U256::cairo_serialized_size(&__rust.value);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.from,
        ));
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.to,
        ));
        __out.extend(cainome::cairo_serde::U256::cairo_serialize(&__rust.value));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let from = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&from);
        let to = cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&to);
        let value = cainome::cairo_serde::U256::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::U256::cairo_serialized_size(&value);
        Ok(Transfer { from, to, value })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub struct OwnershipTransferStarted {
    pub previous_owner: cainome::cairo_serde::ContractAddress,
    pub new_owner: cainome::cairo_serde::ContractAddress,
}
impl cainome::cairo_serde::CairoSerde for OwnershipTransferStarted {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        let mut __size = 0;
        __size +=
            cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.previous_owner);
        __size += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&__rust.new_owner);
        __size
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        let mut __out: Vec<starknet::core::types::FieldElement> = vec![];
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.previous_owner,
        ));
        __out.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            &__rust.new_owner,
        ));
        __out
    }
    fn cairo_deserialize(
        __felts: &[starknet::core::types::FieldElement],
        __offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let mut __offset = __offset;
        let previous_owner =
            cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&previous_owner);
        let new_owner =
            cainome::cairo_serde::ContractAddress::cairo_deserialize(__felts, __offset)?;
        __offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&new_owner);
        Ok(OwnershipTransferStarted {
            previous_owner,
            new_owner,
        })
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum ERC20ComponentEvent {
    Transfer(Transfer),
    Approval(Approval),
}
impl cainome::cairo_serde::CairoSerde for ERC20ComponentEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            ERC20ComponentEvent::Transfer(val) => Transfer::cairo_serialized_size(val) + 1,
            ERC20ComponentEvent::Approval(val) => Approval::cairo_serialized_size(val) + 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            ERC20ComponentEvent::Transfer(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(Transfer::cairo_serialize(val));
                temp
            }
            ERC20ComponentEvent::Approval(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(Approval::cairo_serialize(val));
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
            0usize => Ok(ERC20ComponentEvent::Transfer(Transfer::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            1usize => Ok(ERC20ComponentEvent::Approval(Approval::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "ERC20ComponentEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for ERC20ComponentEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("Transfer")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "Transfer"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let from = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "from", "Transfer", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&from);
            let to = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "to", "Transfer", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&to);
            let value =
                match cainome::cairo_serde::U256::cairo_deserialize(&event.data, data_offset) {
                    Ok(v) => v,
                    Err(e) => {
                        return Err(format!(
                            "Could not deserialize field {} for {}: {:?}",
                            "value", "Transfer", e
                        ))
                    }
                };
            data_offset += cainome::cairo_serde::U256::cairo_serialized_size(&value);
            return Ok(ERC20ComponentEvent::Transfer(Transfer { from, to, value }));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("Approval")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "Approval"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "owner", "Approval", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&owner);
            let spender = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "spender", "Approval", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&spender);
            let value =
                match cainome::cairo_serde::U256::cairo_deserialize(&event.data, data_offset) {
                    Ok(v) => v,
                    Err(e) => {
                        return Err(format!(
                            "Could not deserialize field {} for {}: {:?}",
                            "value", "Approval", e
                        ))
                    }
                };
            data_offset += cainome::cairo_serde::U256::cairo_serialized_size(&value);
            return Ok(ERC20ComponentEvent::Approval(Approval {
                owner,
                spender,
                value,
            }));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
#[derive(Debug, PartialEq, PartialOrd, Clone)]
pub enum OwnableComponentEvent {
    OwnershipTransferred(OwnershipTransferred),
    OwnershipTransferStarted(OwnershipTransferStarted),
}
impl cainome::cairo_serde::CairoSerde for OwnableComponentEvent {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            OwnableComponentEvent::OwnershipTransferred(val) => {
                OwnershipTransferred::cairo_serialized_size(val) + 1
            }
            OwnableComponentEvent::OwnershipTransferStarted(val) => {
                OwnershipTransferStarted::cairo_serialized_size(val) + 1
            }
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            OwnableComponentEvent::OwnershipTransferred(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(OwnershipTransferred::cairo_serialize(val));
                temp
            }
            OwnableComponentEvent::OwnershipTransferStarted(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(OwnershipTransferStarted::cairo_serialize(val));
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
            0usize => Ok(OwnableComponentEvent::OwnershipTransferred(
                OwnershipTransferred::cairo_deserialize(__felts, __offset + 1)?,
            )),
            1usize => Ok(OwnableComponentEvent::OwnershipTransferStarted(
                OwnershipTransferStarted::cairo_deserialize(__felts, __offset + 1)?,
            )),
            _ => {
                return Err(cainome::cairo_serde::Error::Deserialize(format!(
                    "Index not handle for enum {}",
                    "OwnableComponentEvent"
                )))
            }
        }
    }
}
impl TryFrom<starknet::core::types::EmittedEvent> for OwnableComponentEvent {
    type Error = String;
    fn try_from(event: starknet::core::types::EmittedEvent) -> Result<Self, Self::Error> {
        use cainome::cairo_serde::CairoSerde;
        if event.keys.is_empty() {
            return Err("Event has no key".to_string());
        }
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnershipTransferred")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnershipTransferred"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let previous_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "previous_owner", "OwnershipTransferred", e
                    ))
                }
            };
            key_offset +=
                cainome::cairo_serde::ContractAddress::cairo_serialized_size(&previous_owner);
            let new_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner", "OwnershipTransferred", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&new_owner);
            return Ok(OwnableComponentEvent::OwnershipTransferred(
                OwnershipTransferred {
                    previous_owner,
                    new_owner,
                },
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnershipTransferStarted")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnershipTransferStarted"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let previous_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "previous_owner", "OwnershipTransferStarted", e
                    ))
                }
            };
            key_offset +=
                cainome::cairo_serde::ContractAddress::cairo_serialized_size(&previous_owner);
            let new_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner", "OwnershipTransferStarted", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&new_owner);
            return Ok(OwnableComponentEvent::OwnershipTransferStarted(
                OwnershipTransferStarted {
                    previous_owner,
                    new_owner,
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
pub enum Event {
    ERC20Event(ERC20ComponentEvent),
    OwnableEvent(OwnableComponentEvent),
}
impl cainome::cairo_serde::CairoSerde for Event {
    type RustType = Self;
    const SERIALIZED_SIZE: std::option::Option<usize> = std::option::Option::None;
    #[inline]
    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            Event::ERC20Event(val) => ERC20ComponentEvent::cairo_serialized_size(val) + 1,
            Event::OwnableEvent(val) => OwnableComponentEvent::cairo_serialized_size(val) + 1,
            _ => 0,
        }
    }
    fn cairo_serialize(__rust: &Self::RustType) -> Vec<starknet::core::types::FieldElement> {
        match __rust {
            Event::ERC20Event(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&0usize));
                temp.extend(ERC20ComponentEvent::cairo_serialize(val));
                temp
            }
            Event::OwnableEvent(val) => {
                let mut temp = vec![];
                temp.extend(usize::cairo_serialize(&1usize));
                temp.extend(OwnableComponentEvent::cairo_serialize(val));
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
            0usize => Ok(Event::ERC20Event(ERC20ComponentEvent::cairo_deserialize(
                __felts,
                __offset + 1,
            )?)),
            1usize => Ok(Event::OwnableEvent(
                OwnableComponentEvent::cairo_deserialize(__felts, __offset + 1)?,
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
            == starknet::core::utils::get_selector_from_name("Transfer")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "Transfer"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let from = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "from", "Transfer", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&from);
            let to = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "to", "Transfer", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&to);
            let value =
                match cainome::cairo_serde::U256::cairo_deserialize(&event.data, data_offset) {
                    Ok(v) => v,
                    Err(e) => {
                        return Err(format!(
                            "Could not deserialize field {} for {}: {:?}",
                            "value", "Transfer", e
                        ))
                    }
                };
            data_offset += cainome::cairo_serde::U256::cairo_serialized_size(&value);
            return Ok(Event::ERC20Event(ERC20ComponentEvent::Transfer(Transfer {
                from,
                to,
                value,
            })));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("Approval")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "Approval"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "owner", "Approval", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&owner);
            let spender = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "spender", "Approval", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&spender);
            let value =
                match cainome::cairo_serde::U256::cairo_deserialize(&event.data, data_offset) {
                    Ok(v) => v,
                    Err(e) => {
                        return Err(format!(
                            "Could not deserialize field {} for {}: {:?}",
                            "value", "Approval", e
                        ))
                    }
                };
            data_offset += cainome::cairo_serde::U256::cairo_serialized_size(&value);
            return Ok(Event::ERC20Event(ERC20ComponentEvent::Approval(Approval {
                owner,
                spender,
                value,
            })));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnershipTransferred")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnershipTransferred"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let previous_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "previous_owner", "OwnershipTransferred", e
                    ))
                }
            };
            key_offset +=
                cainome::cairo_serde::ContractAddress::cairo_serialized_size(&previous_owner);
            let new_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner", "OwnershipTransferred", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&new_owner);
            return Ok(Event::OwnableEvent(
                OwnableComponentEvent::OwnershipTransferred(OwnershipTransferred {
                    previous_owner,
                    new_owner,
                }),
            ));
        };
        let selector = event.keys[0];
        if selector
            == starknet::core::utils::get_selector_from_name("OwnershipTransferStarted")
                .unwrap_or_else(|_| panic!("Invalid selector for {}", "OwnershipTransferStarted"))
        {
            let mut key_offset = 0 + 1;
            let mut data_offset = 0;
            let previous_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "previous_owner", "OwnershipTransferStarted", e
                    ))
                }
            };
            key_offset +=
                cainome::cairo_serde::ContractAddress::cairo_serialized_size(&previous_owner);
            let new_owner = match cainome::cairo_serde::ContractAddress::cairo_deserialize(
                &event.keys,
                key_offset,
            ) {
                Ok(v) => v,
                Err(e) => {
                    return Err(format!(
                        "Could not deserialize field {} for {}: {:?}",
                        "new_owner", "OwnershipTransferStarted", e
                    ))
                }
            };
            key_offset += cainome::cairo_serde::ContractAddress::cairo_serialized_size(&new_owner);
            return Ok(Event::OwnableEvent(
                OwnableComponentEvent::OwnershipTransferStarted(OwnershipTransferStarted {
                    previous_owner,
                    new_owner,
                }),
            ));
        };
        Err(format!(
            "Could not match any event from keys {:?}",
            event.keys
        ))
    }
}
impl<A: starknet::accounts::ConnectedAccount + Sync> Erc20<A> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn total_supply(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("total_supply"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn balance_of(
        &self,
        account: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            account,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("balance_of"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn allowance(
        &self,
        owner: &cainome::cairo_serde::ContractAddress,
        spender: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            owner,
        ));
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            spender,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("allowance"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn totalSupply(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("totalSupply"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn balanceOf(
        &self,
        account: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            account,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("balanceOf"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn owner(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::ContractAddress> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("owner"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn name(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::ByteArray> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("name"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn symbol(
        &self,
    ) -> cainome::cairo_serde::call::FCall<A::Provider, cainome::cairo_serde::ByteArray> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("symbol"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn decimals(&self) -> cainome::cairo_serde::call::FCall<A::Provider, u8> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("decimals"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn transfer_getcall(
        &self,
        recipient: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            recipient,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transfer"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn transfer(
        &self,
        recipient: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            recipient,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transfer"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn transfer_from_getcall(
        &self,
        sender: &cainome::cairo_serde::ContractAddress,
        recipient: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            sender,
        ));
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            recipient,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transfer_from"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn transfer_from(
        &self,
        sender: &cainome::cairo_serde::ContractAddress,
        recipient: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            sender,
        ));
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            recipient,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transfer_from"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn approve_getcall(
        &self,
        spender: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            spender,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("approve"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn approve(
        &self,
        spender: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            spender,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("approve"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn transferFrom_getcall(
        &self,
        sender: &cainome::cairo_serde::ContractAddress,
        recipient: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            sender,
        ));
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            recipient,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transferFrom"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn transferFrom(
        &self,
        sender: &cainome::cairo_serde::ContractAddress,
        recipient: &cainome::cairo_serde::ContractAddress,
        amount: &cainome::cairo_serde::U256,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            sender,
        ));
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            recipient,
        ));
        __calldata.extend(cainome::cairo_serde::U256::cairo_serialize(amount));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transferFrom"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn transfer_ownership_getcall(
        &self,
        new_owner: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            new_owner,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transfer_ownership"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn transfer_ownership(
        &self,
        new_owner: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            new_owner,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transfer_ownership"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn renounce_ownership_getcall(&self) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("renounce_ownership"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn renounce_ownership(&self) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("renounce_ownership"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn transferOwnership_getcall(
        &self,
        newOwner: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            newOwner,
        ));
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transferOwnership"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn transferOwnership(
        &self,
        newOwner: &cainome::cairo_serde::ContractAddress,
    ) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            newOwner,
        ));
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("transferOwnership"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn renounceOwnership_getcall(&self) -> starknet::accounts::Call {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("renounceOwnership"),
            calldata: __calldata,
        }
    }
    #[allow(clippy::ptr_arg)]
    pub fn renounceOwnership(&self) -> starknet::accounts::Execution<A> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::accounts::Call {
            to: self.address,
            selector: starknet::macros::selector!("renounceOwnership"),
            calldata: __calldata,
        };
        self.account.execute(vec![__call])
    }
}
impl<P: starknet::providers::Provider + Sync> Erc20Reader<P> {
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn total_supply(&self) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("total_supply"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn balance_of(
        &self,
        account: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            account,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("balance_of"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn allowance(
        &self,
        owner: &cainome::cairo_serde::ContractAddress,
        spender: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            owner,
        ));
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            spender,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("allowance"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn totalSupply(&self) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("totalSupply"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn balanceOf(
        &self,
        account: &cainome::cairo_serde::ContractAddress,
    ) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::U256> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        __calldata.extend(cainome::cairo_serde::ContractAddress::cairo_serialize(
            account,
        ));
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("balanceOf"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn owner(
        &self,
    ) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::ContractAddress> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("owner"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn name(&self) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::ByteArray> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("name"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn symbol(&self) -> cainome::cairo_serde::call::FCall<P, cainome::cairo_serde::ByteArray> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("symbol"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
    #[allow(clippy::ptr_arg)]
    #[allow(clippy::too_many_arguments)]
    pub fn decimals(&self) -> cainome::cairo_serde::call::FCall<P, u8> {
        use cainome::cairo_serde::CairoSerde;
        let mut __calldata = vec![];
        let __call = starknet::core::types::FunctionCall {
            contract_address: self.address,
            entry_point_selector: starknet::macros::selector!("decimals"),
            calldata: __calldata,
        };
        cainome::cairo_serde::call::FCall::new(__call, self.provider())
    }
}
