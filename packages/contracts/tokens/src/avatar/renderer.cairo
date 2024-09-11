use alexandria_encoding::base64::{Base64Encoder, Base64Decoder, Base64UrlEncoder, Base64UrlDecoder};

use super::avatar::{Avatar, AvatarImpl, AvatarTrait, AvatarParams, AvatarRenderParams};
use super::palette::{Palette, PaletteImpl};

#[starknet::interface]
trait IRenderer<T> {
    fn render(self: @T, token_id: u256, owner: starknet::ContractAddress,) -> ByteArray;
    // fn render_metadata(self: @T, token_id: u256 ,owner: starknet::ContractAddress,) -> ByteArray;
}


pub fn default_renderer(token_id: u256, _owner: starknet::ContractAddress, level: u8) -> ByteArray {
    let seed = token_id.low;

    let mut avatar = AvatarTrait::new(
        AvatarParams {
            seed,
            width: 8,
            height: 16,
            bias: 3,
            mutation_bias: 512,
            level,
            min_border_w: 2,
            max_border_w: 6
        }
    );

    let rendered = avatar
        .render_svg(AvatarRenderParams { pixel_size: 4, palette: PaletteImpl::new_cartridge() });

    let rendered_b64: ByteArray = Base64Encoder::encode(rendered.into()).into();

    format!("data:image/svg+xml;base64,{}", rendered_b64)
    // rendered
}


// to use with cairo-run
pub fn execute_renderer(seed: u128, level: u8, b64: bool) {
    let mut avatar = AvatarTrait::new(
        AvatarParams {
            seed,
            width: 8,
            height: 16,
            bias: 3,
            mutation_bias: 512,
            level,
            min_border_w: 2,
            max_border_w: 6
        }
    );

    let rendered = avatar
        .render_svg(AvatarRenderParams { pixel_size: 4, palette: PaletteImpl::new_cartridge() });

    if b64 {
        let rendered_b64: ByteArray = Base64Encoder::encode(rendered.into()).into();
        println!("data:image/svg+xml;base64,{}", rendered_b64)
    } else {
        println!("{}", rendered);
    }
}

// let res = bytearray_to_array_u8(rendered);
// let encoded = Base64Encoder::encode(res);

// println!("{}", encoded);

pub(crate) impl ByteArrayIntoArrayU8 of Into<ByteArray, Array<u8>> {
    fn into(self: ByteArray) -> Array<u8> {
        bytearray_to_array_u8(self)
    }
}

pub(crate) impl ArrayU8IntoByteArray of Into<Array<u8>, ByteArray> {
    fn into(self: Array<u8>) -> ByteArray {
        array_u8_to_bytearray(self)
    }
}

fn bytearray_to_array_u8(ba: ByteArray) -> Array<u8> {
    let mut i = 0;
    let mut res = array![];

    while let Option::Some(char) = ba.at(i) {
        res.append(char);
        i += 1;
    };

    res
}

fn array_u8_to_bytearray(mut arr: Array<u8>) -> ByteArray {
    let mut ba = "";
    while let Option::Some(char) = arr.pop_front() {
        ba.append_byte(char);
    };
    ba
}

