use std::vec;

use starknet::{
    core::{crypto::Signature, types::FieldElement},
    signers::VerifyingKey,
};

use crate::abigen::account::{Call, SessionSignature, SignatureProofs};

use super::{
    hash::{self, calculate_merkle_proof, compute_call_hash, compute_root},
    SESSION_SIGNATURE_TYPE,
};

#[derive(Clone)]
pub struct CallWithProof(pub Call, pub Vec<FieldElement>);

#[derive(Clone)]
pub struct Session {
    session_key: VerifyingKey,
    expires: u64,
    calls: Vec<CallWithProof>,
    session_token: Vec<FieldElement>,
    root: FieldElement,
}

#[derive(Debug, thiserror::Error)]
pub enum SessionError {
    #[error("At least one call has to be permitted")]
    NoCallsPermited,
    #[error("Call is not one of the allowed calls")]
    CallNotInPolicy,
    #[error("Call to compute method failed")]
    ChainCallFailed,
}

impl Session {
    pub fn new(key: VerifyingKey, expires: u64) -> Self {
        Self {
            session_key: key,
            expires,
            calls: vec![],
            session_token: vec![],
            root: FieldElement::ZERO,
        }
    }

    pub fn session_expires(&self) -> u64 {
        self.expires
    }

    pub fn session_token(&self) -> &Vec<FieldElement> {
        &self.session_token
    }

    pub fn call_with_proof(&self, position: usize) -> &CallWithProof {
        &self.calls[position]
    }

    pub async fn set_policy(
        &mut self,
        calls: Vec<Call>,
        chain_id: FieldElement,
        address: FieldElement,
    ) -> Result<FieldElement, SessionError> {
        if calls.is_empty() {
            Err(SessionError::NoCallsPermited)?;
        }

        self.calls = Vec::with_capacity(calls.len());

        let call_hashes = calls.iter().map(compute_call_hash).collect::<Vec<_>>();

        for (i, call) in calls.iter().enumerate() {
            let proof = calculate_merkle_proof(&call_hashes, i);
            let call_with_proof = CallWithProof(call.clone(), proof);
            self.calls.push(call_with_proof);
        }

        self.root = compute_root(call_hashes[0], self.calls[0].1.clone());

        // Only three fields are hashed: session_key, session_expires and root
        let signature = self.partial_signature();

        let session_hash = hash::compute_session_hash(signature, chain_id, address);

        Ok(session_hash)
    }

    pub fn set_token(&mut self, token: Signature) {
        self.session_token = vec![token.r, token.s];
    }

    pub fn signature(
        &self,
        transaction_signature: Signature,
        signed_calls: Vec<Call>,
    ) -> Result<SessionSignature, SessionError> {
        let proofs = signed_calls
            .iter()
            .map(|c| self.call_proof(c).ok_or(SessionError::CallNotInPolicy))
            .collect::<Result<Vec<_>, SessionError>>()?;

        let proofs_flat = proofs.into_iter().try_fold(vec![], |mut acc, proof| {
            acc.extend(proof.1.clone());
            Ok(acc)
        })?;

        assert!(!self.session_token().is_empty(), "Session token is empty");

        Ok(SessionSignature {
            signature_type: SESSION_SIGNATURE_TYPE,
            r: transaction_signature.r,
            s: transaction_signature.s,
            session_key: self.session_key.scalar(),
            session_expires: self.expires,
            root: self.root,
            proofs: SignatureProofs {
                single_proof_len: (proofs_flat.len() / signed_calls.len()) as u32,
                proofs_flat,
            },
            session_token: self.session_token.clone(),
        })
    }

    pub fn partial_signature(&self) -> SessionSignature {
        SessionSignature {
            signature_type: FieldElement::ZERO,
            r: FieldElement::ZERO,
            s: FieldElement::ZERO,
            session_key: self.session_key.scalar(),
            session_expires: self.expires,
            root: self.root,
            proofs: SignatureProofs {
                single_proof_len: 0,
                proofs_flat: vec![],
            },
            session_token: vec![],
        }
    }

    fn call_proof(&self, call: &Call) -> Option<&CallWithProof> {
        self.calls
            .iter()
            .find(|CallWithProof(c, _)| c.to == call.to && c.selector == call.selector)
    }
}
