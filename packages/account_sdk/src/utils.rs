/// Normalizes an address or chain ID string by:
/// - Converting to lowercase
/// - Removing "0x" prefix
/// - Trimming leading zeros
/// - Adding "0x" prefix back
/// - Ensuring empty strings become "0x0"
pub fn normalize_address(addr: &str) -> String {
    let addr = addr.to_lowercase();
    let addr = addr.trim_start_matches("0x");
    let addr = addr.trim_start_matches('0');

    if addr.is_empty() {
        "0x0".to_string()
    } else {
        format!("0x{}", addr)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_address() {
        assert_eq!(normalize_address("0x123"), "0x123");
        assert_eq!(normalize_address("0X123"), "0x123");
        assert_eq!(normalize_address("123"), "0x123");
        assert_eq!(normalize_address("0x0123"), "0x123");
        assert_eq!(normalize_address("0x00123"), "0x123");
        assert_eq!(normalize_address("0x0"), "0x0");
        assert_eq!(normalize_address("0"), "0x0");
        assert_eq!(normalize_address(""), "0x0");
        assert_eq!(normalize_address("0x"), "0x0");
        assert_eq!(normalize_address("0x00"), "0x0");
    }
}
