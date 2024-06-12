use std::marker::PhantomData;

use cairo_args_runner::errors::SierraRunnerError;
use cairo_args_runner::SuccessfulRun;
use cairo_args_runner::{Arg, Felt252};

pub const WEBAUTHN_SIERRA_TARGET: &str = "../../../target/dev/controller_auth.sierra.json";
pub const SESSION_SIERRA_TARGET: &str = "../../../target/dev/controller_session.sierra.json";

#[derive(Debug, Clone, Copy)]
pub struct Function<'a, AP, RE>
where
    AP: ArgumentParser,
    RE: ResultExtractor,
{
    pub sierra_target: &'a str,
    pub name: &'a str,
    pub parser: AP,
    pub extractor: RE,
}

pub trait FunctionTrait {
    type Args;
    type Result;
    fn run(self, args: Self::Args) -> Self::Result;
}

impl<'a, AP, RE> Function<'a, AP, RE>
where
    AP: ArgumentParser,
    RE: ResultExtractor,
{
    pub const fn new(sierra_target: &'a str, name: &'a str, parser: AP, extractor: RE) -> Self {
        Self {
            sierra_target,
            name,
            parser,
            extractor,
        }
    }
    pub const fn new_webauthn(name: &'a str, parser: AP, extractor: RE) -> Self {
        Self::new(WEBAUTHN_SIERRA_TARGET, name, parser, extractor)
    }
    pub const fn new_session(name: &'a str, parser: AP, extractor: RE) -> Self {
        Self::new(SESSION_SIERRA_TARGET, name, parser, extractor)
    }
}

impl<'a, AP, RE> FunctionTrait for &'a Function<'a, AP, RE>
where
    AP: ArgumentParser,
    RE: ResultExtractor,
{
    type Args = AP::Args;

    type Result = RE::Result;

    fn run(self, args: Self::Args) -> Self::Result {
        let parsed_args = self.parser.parse(args);
        let result =
            cairo_args_runner::run_capture_memory(self.sierra_target, self.name, &parsed_args);
        self.extractor.extract(result)
    }
}

pub trait ArgumentParser {
    type Args;
    fn parse(&self, args: Self::Args) -> Vec<Arg>;
}

pub trait ResultExtractor {
    type Result;
    fn extract(&self, result: Result<SuccessfulRun, SierraRunnerError>) -> Self::Result;
}

pub struct GenericVecParser<T>
where
    T: Into<Arg>,
{
    _marker: PhantomData<T>,
}

impl<T> GenericVecParser<T>
where
    T: Into<Arg>,
{
    pub const fn new() -> Self {
        Self {
            _marker: PhantomData,
        }
    }
}

impl<T> ArgumentParser for GenericVecParser<T>
where
    T: Into<Arg>,
{
    type Args = Vec<T>;
    fn parse(&self, args: Self::Args) -> Vec<Arg> {
        args.into_iter().map(Into::into).collect()
    }
}

pub struct GenericVecExtractor<T>
where
    T: From<Felt252>,
{
    _marker: PhantomData<T>,
}

impl<T> GenericVecExtractor<T>
where
    T: From<Felt252>,
{
    pub const fn new() -> Self {
        Self {
            _marker: PhantomData,
        }
    }
}

impl<T> ResultExtractor for GenericVecExtractor<T>
where
    T: From<Felt252>,
{
    type Result = Vec<T>;
    fn extract(&self, result: Result<SuccessfulRun, SierraRunnerError>) -> Self::Result {
        result.unwrap().value.into_iter().map(Into::into).collect()
    }
}

pub struct ConstLenGenericExtractor<const N: usize, T>
where
    T: From<Felt252> + std::fmt::Debug,
{
    _marker: PhantomData<T>,
}

impl<const N: usize, T> ConstLenGenericExtractor<N, T>
where
    T: From<Felt252> + std::fmt::Debug,
{
    pub const fn new() -> Self {
        Self {
            _marker: PhantomData,
        }
    }
}

impl<const N: usize, T> ResultExtractor for ConstLenGenericExtractor<N, T>
where
    T: From<Felt252> + std::fmt::Debug,
{
    type Result = [T; N];
    fn extract(&self, result: Result<SuccessfulRun, SierraRunnerError>) -> Self::Result {
        result
            .unwrap()
            .value
            .into_iter()
            .map(From::from)
            .collect::<Vec<_>>()
            .try_into()
            .unwrap()
    }
}

pub type SimpleVecParser = GenericVecParser<Arg>;
pub type SimpleVecExtractor = GenericVecExtractor<Felt252>;
pub type ConstLenExtractor<const N: usize> = ConstLenGenericExtractor<N, Felt252>;
