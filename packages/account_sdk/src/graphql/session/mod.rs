use crate::api::Client;
use anyhow::Result;
use create_session::ResponseData;
use graphql_client::GraphQLQuery;

#[allow(clippy::upper_case_acronyms)]
type JSON = String;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "schema.json",
    query_path = "src/graphql/session/create-session.graphql",
    response_derives = "Debug, Clone, Serialize, PartialEq, Eq, Deserialize"
)]
pub struct CreateSession;

pub struct CreateSessionInput {
    pub hash: String,
    pub account_id: String,
    pub controller_address: String,
    pub app_id: String,
    pub chain_id: String,
    pub authorization: Vec<String>,
    pub metadata: JSON,
    pub expires_at: String,
}

pub async fn create_session(input: CreateSessionInput) -> Result<create_session::ResponseData> {
    let client = Client::new();

    let request_body = CreateSession::build_query(create_session::Variables {
        session: create_session::CreateSessionInput {
            hash: input.hash.clone(),
            account_id: input.account_id,
            controller_address: input.controller_address,
            app_id: input.app_id,
            chain_id: input.chain_id,
            authorization: input.authorization,
            metadata: Some(input.metadata),
            expires_at: input.expires_at,
        },
    });

    let res: ResponseData = client.query(&request_body).await?;

    Ok(res)
}
