#[cfg(target_arch = "wasm32")]
use js_sys::Date;

#[cfg(not(target_arch = "wasm32"))]
pub fn get_current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs()
}

#[cfg(target_arch = "wasm32")]
pub fn get_current_timestamp() -> u64 {
    (Date::now() / 1000.0) as u64
}
