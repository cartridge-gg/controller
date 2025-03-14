use std::env;

pub fn get_cartridge_keychain_url() -> String {
    return get_env("CARTRIDGE_KEYCHAIN_URL", "http://localhost:3001");
}

pub fn get_cartridge_api_url() -> String {
    return get_env("CARTRIDGE_API_URL", "http://localhost:8000");
}

pub fn get_env(key: &str, default: &str) -> String {
    match env::var(key) {
        Ok(val) => val,
        Err(_e) => default.to_string(),
    }
}
