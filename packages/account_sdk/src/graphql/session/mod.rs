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
    session_hash: String,
    account_id: String,
    controller_address: String,
    chain_id: String,
    app_id: String,
    metadata: Option<JSON>,
    authorization: Vec<String>,
    signer_type: SignerType,
    signer_metadata: Option<JSON>,
    expires_at: String,
) -> Result<create_session::ResponseData> {
    #[cfg(target_arch = "wasm32")]
    use web_sys::console;

    let client = Client::new();

    let request_body = CreateSession::build_query(create_session::Variables {
        session: create_session::CreateSessionInput {
            session_hash: session_hash.clone(),
            account_id: account_id.clone(),
            controller_address: controller_address.clone(),
            chain_id: chain_id.clone(),
            app_id: app_id.clone(),
            metadata: metadata.clone(),
            authorization: authorization.clone(),
            signer_type: signer_type.clone(),
            signer_metadata: signer_metadata.clone(),
            expires_at: expires_at.clone(),
        },
    });

    // print out all the fields for created_session
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("session_hash: {:?}", &session_hash).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("account_id: {:?}", &account_id).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("controller_address: {:?}", &controller_address).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("chain_id: {:?}", &chain_id).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("app_id: {:?}", &app_id).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("authorization: {:?}", &authorization).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("metadata: {:?}", &metadata).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("signer_type: {:?}", &signer_type).into());
    #[cfg(target_arch = "wasm32")]
    console::log_1(&format!("expires_at: {:?}", &expires_at).into());

    let res: ResponseData = client.query(&request_body).await?;

    Ok(res)
}
