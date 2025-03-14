use crate::{api::Client, graphql::session::create_session::SignerType};
use create_session::ResponseData;
use graphql_client::GraphQLQuery;
use anyhow::Result;

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
  address: String,
  chain_id: String,
  app_id: String,
  metadata: Option<JSON>,
  authorization: Vec<String>,
  signer: SignerType,
  expires_at: String,
) -> Result<create_session::ResponseData> {

  let client = Client::new();

  let request_body = CreateSession::build_query(create_session::Variables {
    session: create_session::CreateSessionInput {
      account_id,
      address,
      chain_id,
      app_id,
      metadata,
      authorization,
      signer,
      expires_at,
    },
  });

  let res: ResponseData = client.query(&request_body).await?;

  Ok(res)
}
