#![allow(unused_variables)]
use std::{
    fmt::{self, Display},
    str::FromStr,
};

use serde::{ser, Serialize};
use starknet::core::types::FieldElement;

pub struct Serializer {
    pub output: Vec<FieldElement>,
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    Message(String),
    TypeNotSupported,
    UnknownLength,
}

impl ser::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        Error::Message(msg.to_string())
    }
}

impl Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Message(msg) => formatter.write_str(msg),
            Error::TypeNotSupported => formatter.write_str("Type not supported"),
            Error::UnknownLength => formatter.write_str("Unknown length"),
        }
    }
}

impl std::error::Error for Error {}

pub fn to_felts<T>(value: &T) -> Vec<FieldElement>
where
    T: Serialize,
{
    let mut serializer = Serializer { output: Vec::new() };
    value.serialize(&mut serializer).unwrap();
    serializer.output
}

impl<'a> ser::Serializer for &'a mut Serializer {
    type Ok = ();

    type Error = Error;

    type SerializeSeq = Self;

    type SerializeTuple = Self;

    type SerializeTupleStruct = Self;

    type SerializeTupleVariant = Self;

    type SerializeMap = Self;

    type SerializeStruct = Self;

    type SerializeStructVariant = Self;

    fn serialize_bool(self, v: bool) -> Result<()> {
        self.serialize_u64(u64::from(v))
    }

    fn serialize_i8(self, v: i8) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_i16(self, v: i16) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_i32(self, v: i32) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_i64(self, v: i64) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_u8(self, v: u8) -> Result<()> {
        self.serialize_u64(u64::from(v))
    }

    fn serialize_u16(self, v: u16) -> Result<()> {
        self.serialize_u64(u64::from(v))
    }

    fn serialize_u32(self, v: u32) -> Result<()> {
        self.serialize_u64(u64::from(v))
    }

    fn serialize_u64(self, v: u64) -> Result<()> {
        self.output.push(v.into());
        Ok(())
    }

    fn serialize_f32(self, v: f32) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_f64(self, v: f64) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_char(self, v: char) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_str(self, v: &str) -> Result<()> {
        self.output
            .push(FieldElement::from_str(v).map_err(|e| Error::Message(e.to_string()))?);
        Ok(())
    }

    fn serialize_bytes(self, v: &[u8]) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_none(self) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_some<T: ?Sized>(self, value: &T) -> Result<()>
    where
        T: Serialize,
    {
        Err(Error::TypeNotSupported)
    }

    fn serialize_unit(self) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_unit_struct(self, name: &'static str) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_unit_variant(
        self,
        name: &'static str,
        variant_index: u32,
        variant: &'static str,
    ) -> Result<()> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_newtype_struct<T: ?Sized>(self, name: &'static str, value: &T) -> Result<()>
    where
        T: Serialize,
    {
        value.serialize(self)
    }

    fn serialize_newtype_variant<T: ?Sized>(
        self,
        name: &'static str,
        variant_index: u32,
        variant: &'static str,
        value: &T,
    ) -> Result<()>
    where
        T: Serialize,
    {
        Err(Error::TypeNotSupported)
    }

    fn serialize_seq(self, len: Option<usize>) -> Result<Self::SerializeSeq> {
        match len {
            Some(len) => {
                self.output.push(len.into());
                Ok(self)
            }
            None => Err(Error::UnknownLength),
        }
    }

    fn serialize_tuple(self, len: usize) -> Result<Self::SerializeTuple> {
        Ok(self)
    }

    fn serialize_tuple_struct(
        self,
        name: &'static str,
        len: usize,
    ) -> Result<Self::SerializeTupleStruct> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_tuple_variant(
        self,
        name: &'static str,
        variant_index: u32,
        variant: &'static str,
        len: usize,
    ) -> Result<Self::SerializeTupleVariant> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_map(self, len: Option<usize>) -> Result<Self::SerializeMap> {
        Err(Error::TypeNotSupported)
    }

    fn serialize_struct(self, name: &'static str, len: usize) -> Result<Self::SerializeStruct> {
        Ok(self)
    }

    fn serialize_struct_variant(
        self,
        name: &'static str,
        variant_index: u32,
        variant: &'static str,
        len: usize,
    ) -> Result<Self::SerializeStructVariant> {
        Err(Error::TypeNotSupported)
    }
}

impl<'a> ser::SerializeSeq for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_element<T>(&mut self, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        value.serialize(&mut **self)
    }

    fn end(self) -> Result<()> {
        Ok(())
    }
}

impl<'a> ser::SerializeTuple for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_element<T>(&mut self, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        value.serialize(&mut **self)
    }

    fn end(self) -> Result<()> {
        Ok(())
    }
}

impl<'a> ser::SerializeTupleStruct for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T>(&mut self, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        value.serialize(&mut **self)
    }

    fn end(self) -> Result<()> {
        Ok(())
    }
}

impl<'a> ser::SerializeTupleVariant for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T>(&mut self, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        Err(Error::TypeNotSupported)
    }

    fn end(self) -> Result<()> {
        Err(Error::TypeNotSupported)
    }
}

impl<'a> ser::SerializeMap for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_key<T>(&mut self, key: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        Err(Error::TypeNotSupported)
    }

    fn serialize_value<T>(&mut self, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        Err(Error::TypeNotSupported)
    }

    fn end(self) -> Result<()> {
        Err(Error::TypeNotSupported)
    }
}

impl<'a> ser::SerializeStruct for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T>(&mut self, key: &'static str, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        value.serialize(&mut **self)
    }

    fn end(self) -> Result<()> {
        Ok(())
    }
}

impl<'a> ser::SerializeStructVariant for &'a mut Serializer {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T>(&mut self, key: &'static str, value: &T) -> Result<()>
    where
        T: ?Sized + Serialize,
    {
        Err(Error::TypeNotSupported)
    }

    fn end(self) -> Result<()> {
        Err(Error::TypeNotSupported)
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use starknet::macros::felt;

    #[test]
    fn test_simple_serialization() {
        assert_eq!(to_felts(&42_usize), vec![felt!("42")]);
        assert_eq!(to_felts(&false), vec![felt!("0")]);
        assert_eq!(to_felts(&true), vec![felt!("1")]);
    }

    #[test]
    fn test_sequence_serialization() {
        let vec = (0..100)
            .map(|i| FieldElement::from(usize::try_from(i).unwrap()))
            .collect::<Vec<_>>();
        let mut result = vec.clone();
        result.insert(0, vec.len().into());
        assert_eq!(to_felts(&vec), result);
    }

    #[derive(Debug, Clone, Serialize)]
    struct TestStruct {
        a: FieldElement,
        i: usize,
        x: usize,
    }

    #[test]
    fn test_struct_serialization() {
        let val = TestStruct {
            a: felt!("1234"),
            i: 1830,
            x: 33,
        };
        let result = vec![val.a, val.i.into(), val.x.into()];
        assert_eq!(to_felts(&val), result);
    }

    #[test]
    fn test_struct_sequence_serialization() {
        let val = TestStruct {
            a: felt!("1234"),
            i: 1830,
            x: 33,
        };
        let serialized = vec![val.a, val.i.into(), val.x.into()];
        let seq = (0..100).map(|_| val.clone()).collect::<Vec<_>>();
        let mut result = (0..100)
            .map(|_| serialized.clone())
            .flatten()
            .collect::<Vec<_>>();
        result.insert(0, seq.len().into());
        assert_eq!(to_felts(&seq), result);
    }
}
