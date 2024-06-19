use cairo_args_runner::{Arg, Felt252};

#[derive(Debug)]
pub struct ArgsBuilder {
    args: Vec<Arg>,
}

impl ArgsBuilder {
    pub fn new() -> Self {
        Self { args: Vec::new() }
    }
    #[allow(dead_code)]
    pub fn add_one(mut self, arg: impl Into<Felt252>) -> Self {
        self.args.push(Arg::Value(arg.into()));
        self
    }
    pub fn add_struct(mut self, args: impl IntoIterator<Item = impl Into<Felt252>>) -> Self {
        self.args
            .extend(args.into_iter().map(|arg| Arg::Value(arg.into())));
        self
    }
    pub fn add_array(mut self, args: impl IntoIterator<Item = impl Into<Felt252>>) -> Self {
        self.args
            .push(Arg::Array(args.into_iter().map(|arg| arg.into()).collect()));
        self
    }
    pub fn build(self) -> Vec<Arg> {
        self.args
    }
}

impl Default for ArgsBuilder {
    fn default() -> Self {
        Self::new()
    }
}

pub trait FeltSerialize {
    fn to_felts(self) -> Vec<Felt252>;
}
