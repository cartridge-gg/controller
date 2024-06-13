use core::array::ArrayTrait;
use core::traits::PartialEq;
use core::traits::Into;
use core::clone::Clone;
use controller_auth::types::{
    PublicKeyCredentialDescriptor, PublicKeyCredential, CollectedClientData, DomString
};
use alexandria_math::BitShift;
use core::integer::upcast;


trait ContainsTrait<A, T> {
    fn contains(self: @A, item: @T) -> bool;
}


fn test_array_contains(arr: Array<felt252>, val: felt252) -> bool {
    arr.contains(@val)
}

impl ArrayTContainsImpl<T, impl Teq: PartialEq<T>> of ContainsTrait<Array<T>, T> {
    fn contains(self: @Array<T>, item: @T) -> bool {
        let la: usize = self.len();
        let mut i: usize = 0;
        loop {
            if i == la {
                break false;
            }
            if self.at(i) == item {
                break true;
            }
            i += 1_usize;
        }
    }
}

trait MapTrait<S, T> {
    fn map(self: Array<S>) -> Array<T>;
}

impl ImplIntoMap<
    S, T, impl IntoTS: Into<S, T>, impl TDrop: Drop<T>, impl SDrop: Drop<S>
> of MapTrait<S, T> {
    fn map(mut self: Array<S>) -> Array<T> {
        let mut target: Array<T> = ArrayTrait::new();
        loop {
            match self.pop_front() {
                Option::Some(i) => target.append(i.into()),
                Option::None => { break; }
            };
        };
        target
    }
}

impl ImplPublicKeyCredentialDescriptorIntoArrayu8 of Into<
    PublicKeyCredentialDescriptor, Array<u16>
> {
    fn into(self: PublicKeyCredentialDescriptor) -> Array<u16> {
        self.id
    }
}

fn allow_credentials_contain_credential(
    options: @Array<PublicKeyCredentialDescriptor>, credential: @PublicKeyCredential,
) -> bool {
    let ids: Array<Array<u16>> = options.clone().map();
    ids.contains(credential.id)
}

fn concatenate(a: @Array<u8>, b: @Array<u8>) -> Array<u8> {
    let mut i: usize = 0;
    let mut result: Array<u8> = ArrayTrait::new();
    let a_len = a.len();
    loop {
        if i == a_len {
            break;
        }
        result.append(*a.at(i));
        i += 1_usize;
    };
    let b_len = b.len();
    i = 0;
    loop {
        if i == b_len {
            break;
        }
        result.append(*b.at(i));
        i += 1_usize;
    };
    result
}

fn extract_r_and_s_from_array(arr: @Array<u8>) -> Option<(u256, u256)> {
    let r = match extract_u256_from_u8_array(arr, 0) {
        Option::Some(r) => r,
        Option::None => { return Option::None; }
    };
    let s = match extract_u256_from_u8_array(arr, 32) {
        Option::Some(s) => s,
        Option::None => { return Option::None; }
    };
    Option::Some((r, s))
}

// Interpret the array as a big-endian byte encoding of a u256 number
fn extract_u256_from_u8_array(arr: @Array<u8>, offset: usize) -> Option<u256> {
    let mut n = 0_u256;
    let len = arr.len();
    if len - offset < 32 {
        return Option::None;
    }
    let mut i = 0_usize;
    loop {
        if i == 32 {
            break;
        };
        n = n | BitShift::shl((*arr[i + offset]).into(), ((32 - (i + 1)) * 8).into());
        i += 1;
    };
    Option::Some(n)
}

// A dummy string representation, waiting for Cairo support of strings
#[derive(Drop, Clone)]
struct MyString {
    data: Array<u8>
}

trait UTF8Decoder {
    fn decode(data: Array<u8>) -> MyString;
}

trait JSONClientDataParser {
    fn parse(string: MyString) -> CollectedClientData;
}

trait OriginChecker {
    fn check(string: DomString) -> bool;
}
