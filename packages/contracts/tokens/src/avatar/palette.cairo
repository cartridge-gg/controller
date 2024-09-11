#[derive(Drop, Clone)]
pub struct Palette {
    pub colors: Array<ByteArray>
}

#[generate_trait]
pub impl PaletteImpl of PaletteTrait {
    fn new(colors: Array<ByteArray>) -> Palette {
        Palette { colors }
    }

    fn new_og() -> Palette {
        Palette {
            colors: array![
                "#D98CFD",
                "#B2E9ED",
                "#F18034",
                "#B5EE5F",
                "#3BE2ED",
                "#5FEEBB",
                "#EC5146",
                "#EE5FA4",
            ]
        }
    }

    fn new_cartridge() -> Palette {
        Palette {
            colors: array![
                "#ffc52a", // yellow
                "#1e221f", // dark green
                "#939393", // grey
                "#ee2d3f", // dojo red
                "#f9f9f2", // white
                "#5b5bd6", // dojo blue
            ]
        }
    }

    fn get_color(self: @Palette, seed: u128) -> ByteArray {
        let idx: u32 = (seed % self.colors.len().into()).try_into().unwrap();
        self.colors.at(idx).clone()
    }
}

