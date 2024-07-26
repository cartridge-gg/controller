use cainome::cairo_serde::U256;

use crate::signers::SignError;

use super::DeviceError;

pub fn parse_der_signature(encoded_sig: &[u8]) -> Result<(U256, U256), SignError> {
    if encoded_sig.len() < 8 || encoded_sig[0] != 0x30 {
        return Err(SignError::Device(DeviceError::BadAssertion(
            "Invalid DER signature".to_string(),
        )));
    }

    let r_start = 4;
    let r_len = encoded_sig[3] as usize;
    let s_start = r_start + r_len + 2;
    let s_len = encoded_sig[r_start + r_len + 1] as usize;

    if s_start + s_len > encoded_sig.len() {
        return Err(SignError::Device(DeviceError::BadAssertion(
            "Invalid DER signature length".to_string(),
        )));
    }

    let r = parse_bigint(&encoded_sig[r_start..r_start + r_len])?;
    let s = parse_bigint(&encoded_sig[s_start..s_start + s_len])?;

    Ok((r, s))
}

pub fn parse_bigint(bytes: &[u8]) -> Result<U256, SignError> {
    if bytes.len() > 32 {
        if bytes[0] != 0 {
            return Err(SignError::Device(DeviceError::BadAssertion(
                "Invalid big integer encoding".to_string(),
            )));
        }
        Ok(U256::from_bytes_be(&bytes[1..].try_into().unwrap()))
    } else {
        Ok(U256::from_bytes_be(bytes.try_into().unwrap()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_der_signature() {
        let encoded_sig = hex::decode("3045022100d43908065193a1bf82a46e5db5e216fcfcb238a98d5ba00f62d59d45d3e46b4602203330d72eaea09786687e1e1b4875df94d1d430ec0998316320fda27d3a38a897").unwrap();
        let ecdsa_sig = ecdsa::Signature::<p256::NistP256>::from_der(&encoded_sig).unwrap();
        let expected_r =
            U256::from_bytes_be(ecdsa_sig.r().to_bytes().as_slice().try_into().unwrap());
        let expected_s =
            U256::from_bytes_be(ecdsa_sig.s().to_bytes().as_slice().try_into().unwrap());

        let (r, s) = parse_der_signature(&encoded_sig).unwrap();

        assert_eq!(r, expected_r);
        assert_eq!(s, expected_s);
    }
}
