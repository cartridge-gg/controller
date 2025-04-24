use crate::api::Client;
use anyhow::Result;
use create_session::ResponseData;
use graphql_client::GraphQLQuery;
use starknet_crypto::Felt;

type Long = u64;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "schema.json",
    query_path = "src/graphql/session/create-session.graphql",
    response_derives = "Debug, Clone, Serialize, PartialEq, Eq, Deserialize"
)]
pub struct CreateSession;

pub struct SessionInput {
    pub expires_at: Long,
    pub allowed_policies_root: Felt,
    pub metadata_hash: Felt,
    pub session_key_guid: Felt,
    pub guardian_key_guid: Felt,
    pub authorization: Vec<Felt>,
}

pub struct CreateSessionInput {
    pub username: String,
    pub app_id: String,
    pub chain_id: String,
    pub session: SessionInput,
}
//
pub async fn create_session(input: CreateSessionInput) -> Result<create_session::ResponseData> {
    let client = Client::new();

    let request_body = CreateSession::build_query(create_session::Variables {
        username: input.username,
        app_id: input.app_id,
        chain_id: input.chain_id,
        session: create_session::SessionInput {
            expires_at: input.session.expires_at,
            allowed_policies_root: input.session.allowed_policies_root,
            metadata_hash: input.session.metadata_hash,
            session_key_guid: input.session.session_key_guid,
            guardian_key_guid: input.session.guardian_key_guid,
            authorization: input.session.authorization,
        },
    });

    let res: ResponseData = client.query(&request_body).await?;

    Ok(res)
}
