pub fn find_value_index_length(json_str: &str, key: &str) -> Option<(usize, usize)> {
    let key_index = json_str.find(&format!("\"{}\"", key))?;

    let colon_index = json_str[key_index..].find(':')? + key_index;

    let value_start_index = json_str[colon_index + 1..].find('"')?;

    let value_length = json_str[colon_index + 1 + value_start_index + 1..]
        .find('"')
        .unwrap();

    Some((colon_index + 1 + value_start_index + 1, value_length))
}

#[cfg(test)]
mod tests {
    use super::find_value_index_length;
    #[test]
    fn test_find_value_index() {
        let json_str =
            r#"{"type":"webauthn.get","challenge":"aGVsbG8=","origin":"https://example.com"}"#;
        assert_eq!(find_value_index_length(json_str, "type"), Some((9, 12)));
        assert_eq!(
            find_value_index_length(json_str, "challenge"),
            Some((36, 8))
        );
        assert_eq!(find_value_index_length(json_str, "origin"), Some((56, 19)));
    }

    #[test]
    fn test_find_value_index_whitespace() {
        let json_str = r#"{   "type":      "webauthn.get",  "challenge":   "aGVsbG8=","origin":    "https://example.com"}"#;
        assert_eq!(find_value_index_length(json_str, "type"), Some((18, 12)));
        assert_eq!(
            find_value_index_length(json_str, "challenge"),
            Some((50, 8))
        );
        assert_eq!(find_value_index_length(json_str, "origin"), Some((74, 19)));
    }
}
