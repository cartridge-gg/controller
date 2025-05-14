use std::fmt::{self};

use graphql_client::Response;
use reqwest::RequestBuilder;
use serde::{de::DeserializeOwned, Serialize};
use url::Url;

use crate::errors::ControllerError;
use crate::vars;

#[derive(Debug)]
pub struct Client {
    base_url: Url,
    client: reqwest::Client,
}

impl Client {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: Url::parse(vars::get_cartridge_api_url().as_str()).expect("valid url"),
        }
    }

    pub async fn query<R, T>(&self, body: &T) -> Result<R, ControllerError>
    where
        R: DeserializeOwned,
        T: Serialize + ?Sized,
    {
        let path = "/query";

        let response = self.post(path).json(body).send().await?;

        let res: Response<R> = response.json().await?;

        if let Some(errors) = res.errors {
            Err(ControllerError::Api(GraphQLErrors(errors)))
        } else {
            Ok(res.data.unwrap())
        }
    }

    fn post(&self, path: &str) -> RequestBuilder {
        let url = self.get_url(path);
        self.client.post(url)
    }

    fn get_url(&self, path: &str) -> Url {
        let mut url = self.base_url.clone();
        url.path_segments_mut().unwrap().extend(path.split('/'));
        url
    }
}

impl Default for Client {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, thiserror::Error)]
pub struct GraphQLErrors(Vec<graphql_client::Error>);

impl fmt::Display for GraphQLErrors {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for err in &self.0 {
            writeln!(f, "ControllerError: {}", err.message)?;
        }
        Ok(())
    }
}
