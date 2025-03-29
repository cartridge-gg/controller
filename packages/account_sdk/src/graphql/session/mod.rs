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

pub struct CreateSessionInput {
    pub session_hash: String,
    pub account_id: String,
    pub controller_address: String,
    pub chain_id: String,
    pub app_id: String,
    pub metadata: Option<JSON>,
    pub authorization: Vec<String>,
    pub signer_type: SignerType,
    pub signer_metadata: Option<JSON>,
    pub expires_at: String,
}

pub async fn create_session(input: CreateSessionInput) -> Result<create_session::ResponseData> {
    #[cfg(target_arch = "wasm32")]
    use web_sys::console;

    let client = Client::new();

    let request_body = CreateSession::build_query(create_session::Variables {
        session: create_session::CreateSessionInput {
            session_hash: input.session_hash.clone(),
            account_id: input.account_id.clone(),
            controller_address: input.controller_address.clone(),
            chain_id: input.chain_id.clone(),
            app_id: input.app_id.clone(),
            metadata: input.metadata.clone(),
            authorization: input.authorization.clone(),
            signer_type: input.signer_type.clone(),
            signer_metadata: input.signer_metadata.clone(),
            expires_at: input.expires_at.clone(),
        },
    });

    // print out all the fields for created_session
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("session_hash: {:?}", &input.session_hash).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("account_id: {:?}", &input.account_id).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("controller_address: {:?}", &input.controller_address).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("chain_id: {:?}", &input.chain_id).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("app_id: {:?}", &input.app_id).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("authorization: {:?}", &input.authorization).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("metadata: {:?}", &input.metadata).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("signer_type: {:?}", &input.signer_type).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("expires_at: {:?}", &input.expires_at).into());

    let res: ResponseData = client.query(&request_body).await?;

    Ok(res)
}
