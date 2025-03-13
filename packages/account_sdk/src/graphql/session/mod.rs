use create_session::SignerType;
use graphql_client::GraphQLQuery;
use reqwest::Client;
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
  authorization: Vec<std::string::String>,
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
  let path = "http://localhost:8000/query";
  let response = client
      .post(path)
      .json(&request_body)
      .send()
      .await?;

  let res = response.json::<create_session::ResponseData>().await?;

  Ok(res)
}
