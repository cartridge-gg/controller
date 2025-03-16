use crate::{api::Client, graphql::session::create_session::SignerType};
use anyhow::Result;
use create_session::ResponseData;
use graphql_client::GraphQLQuery;

type JSON = String;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "schema.json",
    query_path = "src/graphql/session/create-session.graphql",
    response_derives = "Debug, Clone, Serialize, PartialEq, Eq, Deserialize"
)]
pub struct CreateSession;

pub async fn create_session(
    account_id: String,
    controller_address: String,
    app_id: String,
    chain_id: String,
    authorization: Vec<String>,
    metadata: Option<JSON>,
    signer_type: SignerType,
    signer_metadata: Option<JSON>,
    expires_at: String,
) -> Result<create_session::ResponseData> {
    let client = Client::new();

    let request_body = CreateSession::build_query(create_session::Variables {
        session: create_session::CreateSessionInput {
            account_id,
            controller_address,
            chain_id,
            app_id,
            metadata,
            authorization,
            signer_type,
            signer_metadata,
            expires_at,
        },
    });

    let res: ResponseData = client.query(&request_body).await?;

    Ok(res)
}
