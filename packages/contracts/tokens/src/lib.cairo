mod avatar {
    pub mod avatar;
    pub mod avatar_nft;
    pub mod metadata;
    pub mod renderer;
    pub mod palette;

    #[cfg(test)]
    pub mod test_avatar;
}

mod components {
    pub mod executable;
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {}
}
