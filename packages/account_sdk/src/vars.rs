use std::env;

pub fn get_cartridge_keychain_url() -> String {
    // if cfg!(debug_assertions) {
    //     return "http://localhost:3001".to_string();
    // }
    // return get_env("CARTRIDGE_KEYCHAIN_URL", "https://x.cartridge.gg")
    return get_env("CARTRIDGE_KEYCHAIN_URL", "http://localhost:3001");
}

pub fn get_cartridge_api_url() -> String {
    // if cfg!(debug_assertions) {
    //     return "http://localhost:8000".to_string();
    // }
    // return get_env("CARTRIDGE_API_URL", "https://api.cartridge.gg")
    return get_env("CARTRIDGE_API_URL", "http://localhost:8000");
}

pub fn get_env(key: &str, default: &str) -> String {
    match env::var(key) {
        Ok(val) => val,
        Err(_e) => default.to_string(),
    }
}
