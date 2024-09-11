use starknet::{ContractAddress, contract_address_const};
use super::renderer::default_renderer;


#[test]
fn test_render() {
    let owner = contract_address_const::<0x1234546789>();
    let token_id: felt252 = owner.into();
    let token_id: u256 = token_id.into();
    default_renderer(token_id, owner, 10);
}

