use starknet_crypto::Felt;

pub struct Selectors;

impl Selectors {
    pub fn active(app_id: &str) -> String {
        format!("@cartridge/{}/active", app_id)
    }

    pub fn account(address: &Felt) -> String {
        format!("@cartridge/account/0x{:x}", address)
    }

    pub fn deployment(address: &Felt, chain_id: &Felt) -> String {
        format!("@cartridge/deployment/0x{:x}/0x{:x}", address, chain_id)
    }

    pub fn admin(address: &Felt, origin: &str) -> String {
        format!(
            "@cartridge/admin/0x{:x}/{}",
            address,
            urlencoding::encode(origin)
        )
    }

    pub fn session(address: &Felt, app_id: &str, chain_id: &Felt) -> String {
        format!(
            "@cartridge/session/0x{:x}/{}/0x{:x}",
            address,
            urlencoding::encode(app_id),
            chain_id
        )
    }
}
