use cainome::cairo_serde::CairoSerde;
use starknet_crypto::FieldElement;

use crate::abigen::cartridge_account::SignerSignature;

pub mod account;

#[derive(Clone, Debug, PartialEq)]
pub struct Session {
    expires_at: u64,
    allowed_methods_root: FieldElement,
    metadata_hash: FieldElement,
    session_key_guid: FieldElement,
}

#[derive(Clone, Debug, PartialEq)]
pub struct SessionToken {
    session: Session,
    session_authorization: Vec<FieldElement>,
    session_signature: SignerSignature,
    guardian_signature: SignerSignature,
}

impl CairoSerde for Session {
    type RustType = Self;

    fn cairo_serialized_size(rust: &Self::RustType) -> usize {
        u64::cairo_serialized_size(&rust.expires_at)
            + FieldElement::cairo_serialized_size(&rust.allowed_methods_root)
            + FieldElement::cairo_serialized_size(&rust.metadata_hash)
            + FieldElement::cairo_serialized_size(&rust.session_key_guid)
    }

    fn cairo_serialize(rust: &Self::RustType) -> Vec<FieldElement> {
        vec![
            u64::cairo_serialize(&rust.expires_at),
            FieldElement::cairo_serialize(&rust.allowed_methods_root),
            FieldElement::cairo_serialize(&rust.metadata_hash),
            FieldElement::cairo_serialize(&rust.session_key_guid),
        ]
        .concat()
    }

    fn cairo_deserialize(
        felts: &[FieldElement],
        mut offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let expires_at = u64::cairo_deserialize(felts, offset)?;
        offset += u64::cairo_serialized_size(&expires_at);
        let allowed_methods_root = FieldElement::cairo_deserialize(felts, offset)?;
        offset += FieldElement::cairo_serialized_size(&allowed_methods_root);
        let metadata_hash = FieldElement::cairo_deserialize(felts, offset)?;
        offset += FieldElement::cairo_serialized_size(&metadata_hash);
        let session_key_guid = FieldElement::cairo_deserialize(felts, offset)?;

        Ok(Self {
            expires_at,
            allowed_methods_root,
            metadata_hash,
            session_key_guid,
        })
    }
}

impl CairoSerde for SessionToken {
    type RustType = Self;

    fn cairo_serialized_size(rust: &Self::RustType) -> usize {
        Session::cairo_serialized_size(&rust.session)
            + <Vec<FieldElement>>::cairo_serialized_size(&rust.session_authorization)
            + SignerSignature::cairo_serialized_size(&rust.session_signature)
            + SignerSignature::cairo_serialized_size(&rust.guardian_signature)
    }

    fn cairo_serialize(rust: &Self::RustType) -> Vec<FieldElement> {
        vec![
            Session::cairo_serialize(&rust.session),
            <Vec<FieldElement>>::cairo_serialize(&rust.session_authorization),
            SignerSignature::cairo_serialize(&rust.session_signature),
            SignerSignature::cairo_serialize(&rust.guardian_signature),
        ]
        .concat()
    }

    fn cairo_deserialize(
        felts: &[FieldElement],
        mut offset: usize,
    ) -> cainome::cairo_serde::Result<Self::RustType> {
        let session = Session::cairo_deserialize(felts, offset)?;
        offset += Session::cairo_serialized_size(&session);
        let session_authorization = <Vec<FieldElement>>::cairo_deserialize(felts, offset)?; 
        offset += <Vec<FieldElement>>::cairo_serialized_size(&session_authorization);
        let session_signature = SignerSignature::cairo_deserialize(felts, offset)?;
        offset += SignerSignature::cairo_serialized_size(&session_signature);
        let guardian_signature = SignerSignature::cairo_deserialize(felts, offset)?;

        Ok(Self {
            session,
            session_authorization,
            session_signature,
            guardian_signature,
        })
    }
}
