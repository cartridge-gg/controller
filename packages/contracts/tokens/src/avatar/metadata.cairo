use alexandria_encoding::base64::{Base64Encoder, Base64Decoder, Base64UrlEncoder, Base64UrlDecoder};
use graffiti::json::JsonImpl;

#[derive(Clone, Drop)]
pub struct NftAttribute {
    pub trait_type: ByteArray,
    pub value: ByteArray,
}

#[derive(Clone, Drop)]
pub struct NftMetadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image: ByteArray,
    pub external_url: ByteArray,
    pub attributes: Array<NftAttribute>,
}

pub fn generate_metadata(metadata: NftMetadata) -> ByteArray {
    let mut attributes_json = array![];

    let mut attributes = metadata.attributes;
    while let Option::Some(attr) = attributes
        .pop_front() {
            let attr_json = JsonImpl::new()
                .add("trait_type", attr.trait_type)
                .add("value", attr.value)
                .build();
            attributes_json.append(attr_json);
        };

    JsonImpl::new()
        .add("name", metadata.name)
        .add("description", metadata.description)
        .add("image", metadata.image)
        .add("external_url", metadata.external_url)
        .add_array("attributes", attributes_json.span())
        .build()
}


pub fn bytearray_to_array_u8(ba: ByteArray) -> Array<u8> {
    let mut i = 0;
    let mut res = array![];

    while let Option::Some(char) = ba.at(i) {
        res.append(char);
        i += 1;
    };

    res
}

pub fn array_u8_to_bytearray(mut arr: Span<u8>) -> ByteArray {
    let mut ba = "";
    while let Option::Some(char) = arr.pop_front() {
        ba.append_byte(*char);
    };
    ba
}
