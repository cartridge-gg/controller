use core::traits::Into;
use core::array::ArrayTrait;
use core::traits::Destruct;
use core::dict::Felt252DictTrait;
use core::option::OptionTrait;
use core::traits::TryInto;
use core::dict::{Felt252DictEntryTrait, Felt252Dict};
use core::zeroable::NonZero;

use super::palette::{Palette, PaletteImpl};

use graffiti::{Tag, TagImpl};

#[derive(Destruct)]
pub struct Avatar {
    pub params: AvatarParams,
    pub grid: Felt252Dict<u32>,
}

#[derive(Destruct, Copy, Clone)]
pub struct AvatarParams {
    pub seed: u128,
    pub width: u32,
    pub height: u32,
    pub bias: NonZero<u128>,
    pub mutation_bias: u128,
    pub level: u8,
    pub min_border_w: u8,
    pub max_border_w: u8,
}

#[derive(Drop, Clone)]
pub struct AvatarRenderParams {
    pub pixel_size: u32,
    pub palette: Palette
}


#[generate_trait]
pub impl AvatarImpl of AvatarTrait {
    fn new(params: AvatarParams) -> Avatar {
        let mut avatar = Avatar { params, grid: Default::default() };

        avatar.init();
        avatar.evolve();

        avatar
    }

    fn init(ref self: Avatar) {
        let pixels = self.params.width * self.params.height;
        let mut i = 0;

        loop {
            if i == pixels {
                break;
            }

            let prob = self.params.seed / ((self.params.level.into() + 1) * (pixels - i)).into();
            let (_, event) = DivRem::div_rem(prob, self.params.bias);

            if event == 1 {
                self.grid.insert(i.into(), 1);
            }

            i += 1;
        };
    }

    fn evolve(ref self: Avatar) {
        let mut i = 0;
        loop {
            if i == self.params.level {
                break;
            }

            i += 1;
            self.grow();
        }
    }

    fn grow(ref self: Avatar) {
        let pixels = self.params.width * self.params.height;
        let mut i = 0;

        loop {
            if i == pixels {
                break;
            }

            let grid_cell = self.grid.get(i.into());
            let neighbors = self.num_neighbors(i);

            let alive = grid_cell > 0;

            if alive {
                // should_die
                if neighbors <= 2 {
                    self.grid.insert(i.into(), 0);
                } else {
                    self.grid.insert(i.into(), grid_cell + 1);
                }
            } else {
                //should_rebirth
                if neighbors <= 1 {
                    self.grid.insert(i.into(), 1);
                }
            }

            // mutation ?
            let prob = (self.params.seed + i.into()) % self.params.mutation_bias.into();
            if prob == 0 { //  println!("-----MUTATION");
            // self.grid.insert(i.into(), grid_cell + 2);
            }

            // println!("-----");
            // println!("i:{}", i);
            // println!("prob:{}", prob);

            i += 1;
        };
    }

    fn num_neighbors(ref self: Avatar, key: u32) -> u32 {
        let pixels = self.params.width * self.params.height;

        let top = match key < self.params.width {
            true => 0,
            false => self.grid.get((key - self.params.width).into()),
        };

        let bot = match key > pixels - self.params.width {
            true => 0,
            false => self.grid.get((key + self.params.width).into()),
        };

        let width: NonZero<u32> = self.params.width.try_into().unwrap();

        let (_, left_rem) = DivRem::div_rem(key, width);
        let left = match left_rem == 0 {
            true => 0,
            false => self.grid.get((key - 1).into()),
        };

        let (_, right_rem) = DivRem::div_rem(key + width.into() - 1, width);
        let right = match right_rem == 0 {
            true => 0,
            false => self.grid.get((key + 1).into()),
        };

        top + bot + left + right
    }

    #[inline(always)]
    fn border_width(ref self: Avatar) -> u8 {
        if self.params.level > (self.params.max_border_w - self.params.min_border_w) {
            self.params.min_border_w
        } else {
            self.params.max_border_w - self.params.level
        }
    }

    #[inline(always)]
    fn is_border(ref self: Avatar, x: u32, y: u32) -> bool {
        let border_with: u32 = self.border_width().into();
        let is_border = x < border_with || y < border_with || y > self.params.height.clone()
            - border_with
            - 1;
        is_border
    }

    #[inline(always)]
    fn is_external_border(ref self: Avatar, x: u32, y: u32) -> bool {
        let border_with = self.params.min_border_w;
        let is_external_border = x < border_with.into()
            || y < border_with.into()
            || y > self.params.height.clone()
            - border_with.into()
            - 1;
        is_external_border
    }

    fn render_svg(ref self: Avatar, params: AvatarRenderParams) -> ByteArray {
        let pixel_size = params.pixel_size;
        let palette = params.palette;

        let w = 2 * self.params.width * pixel_size;
        let h = self.params.height * pixel_size;

        let svg: Tag = TagImpl::new("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("class", "avatar")
            .attr("viewBox", format!("0 0 {w} {h}"));

        let mut styles_inner = format!(
            ".avatar {{ shape-rendering:crispedges; width:{}px; height:{}px; }}", w, h
        )
            + ".bg { fill: #111111; }"
            + ".bo { fill: black; }"
            + format!(".p {{ width: {}px; height: {}px;}}", pixel_size, pixel_size)
            + format!(".c_0 {{ fill: {}; }}", palette.get_color(self.params.seed))
            + format!(".c_1 {{ fill: {}; }}", palette.get_color(self.params.seed + 1))
            + format!(".c_2 {{ fill: {}; }}", palette.get_color(self.params.seed + 2))
            + format!(".c_3 {{ fill: {}; }}", palette.get_color(self.params.seed + 3))
            + format!(".c_4 {{ fill: {}; }}", palette.get_color(self.params.seed + 4))
            + format!(".c_5 {{ fill: {}; }}", palette.get_color(self.params.seed + 5))
            + format!(".c_6 {{ fill: {}; }}", palette.get_color(self.params.seed + 6))
            + format!(".c_7 {{ fill: {}; }}", palette.get_color(self.params.seed + 7));

        let styles: Tag = TagImpl::new("style").content(styles_inner);

        let bg_rect: Tag = TagImpl::new("rect")
            .attr("class", "bg")
            .attr("x", "0")
            .attr("y", "0")
            .attr("rx", "1")
            .attr("width", format!("{w}"))
            .attr("height", format!("{h}"));

        let mut group: Tag = TagImpl::new("g").attr("class", format!("lvl_{}", self.params.level));

        let mut i = 0;
        while i < self.params.width {
            let mut j = 0;
            while j < self.params.height {
                let idx: felt252 = (i * self.params.width + j).into();
                let grid_cell = self.grid.get(idx);

                if self.is_external_border(i, j) {
                    let pixel_base: Tag = TagImpl::new("rect").attr("class", "p bo");

                    let pixel_left = pixel_base
                        .clone()
                        .attr("x", format!("{}", i * pixel_size))
                        .attr("y", format!("{}", j * pixel_size));

                    let pixel_right = pixel_base
                        .clone()
                        .attr("x", format!("{}", w - ((i + 1) * pixel_size)))
                        .attr("y", format!("{}", j * pixel_size));

                    group = group.insert(pixel_left).insert(pixel_right);

                    j += 1;
                    continue;
                } else if self.is_border(i, j) {
                    j += 1;
                    continue;
                }

                if grid_cell > 0 {
                    let pixel_base: Tag = TagImpl::new("rect")
                        .attr(
                            "class",
                            format!(
                                "p c_{} cn_{}",
                                (self.params.seed.clone() + grid_cell.into()) % 8,
                                grid_cell % 8
                            )
                        );

                    let pixel_left = pixel_base
                        .clone()
                        .attr("x", format!("{}", i * pixel_size))
                        .attr("y", format!("{}", j * pixel_size));

                    let pixel_right = pixel_base
                        .clone()
                        .attr("x", format!("{}", w - ((i + 1) * pixel_size)))
                        .attr("y", format!("{}", j * pixel_size));

                    group = group.insert(pixel_left).insert(pixel_right);
                }
                j += 1;
            };
            i += 1;
        };

        let svg = svg.insert(styles).insert(bg_rect).insert(group);

        svg.build()
    }
}

