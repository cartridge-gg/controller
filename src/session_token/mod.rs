mod account;
mod hash;
mod sequence;
mod session;
#[cfg(test)]
mod test_utils;

pub use account::SessionAccount;
pub use sequence::CallSequence;
pub use session::Session;
use starknet::{core::types::FieldElement, macros::felt};

pub const SESSION_SIGNATURE_TYPE: FieldElement = felt!("0x53657373696f6e20546f6b656e207631"); // 'Session Token v1'

#[cfg(test)]
mod tests {
    use std::time::Duration;

    use cainome::cairo_serde::ContractAddress;
    use starknet::{
        accounts::{Account, ConnectedAccount},
        core::crypto::Signature,
        macros::selector,
        signers::{LocalWallet, Signer, SigningKey},
    };
    use tokio::time::sleep;

    use crate::session_token::SessionAccount;
    use crate::tests::{
        deployment_test::create_account,
        runners::{KatanaRunner, TestnetRunner},
    };
    use crate::{
        abigen::account::{Call, CartridgeAccount},
        session_token::test_utils::create_session_account,
    };

    use super::*;

    #[tokio::test]
    async fn test_session_valid() {
        // Initialize a local starknet instance
        let runner = KatanaRunner::load();

        // Initialize a cartridge account, funding it from the prefunded account
        let prefunded_account = runner.prefunded_single_owner_account().await;
        let (master_account, master_key) = create_account(&prefunded_account).await;

        // Creating a session, that will be used to sign calls
        let session_key = SigningKey::from_secret_scalar(FieldElement::from(2137u32));
        let session_key = LocalWallet::from(session_key);
        let mut session: Session =
            Session::new(session_key.get_public_key().await.unwrap(), u64::MAX);

        // Define what calls are allowed to be signed by the session
        let permitted_calls = vec![Call {
            to: ContractAddress::from(master_account.address()),
            selector: selector!("revoke_session"),
            calldata: vec![],
        }];

        // After defining the calls, the session is hashed...
        let session_hash = session
            .set_policy(
                permitted_calls,
                master_account.chain_id(),
                master_account.address(),
            )
            .await
            .unwrap();

        // ... and signed by the master account
        let session_token = master_key.sign(&session_hash).unwrap();
        session.set_token(session_token);

        // Signed session can be used to sign calls, analogously to the `SingleOwnerAccount`
        let sesion_account = SessionAccount::new(
            master_account.provider(),
            session_key.clone(),
            session,
            master_account.address(),
            master_account.chain_id(),
        );
        let account = CartridgeAccount::new(sesion_account.address(), &sesion_account);
        assert_eq!(sesion_account.address(), master_account.address());

        // The session is used to sign a call
        let revoked_token = vec![FieldElement::from(0x2137u32), FieldElement::from(0x2137u32)];
        account.revoke_session(&revoked_token).send().await.unwrap();
    }

    #[tokio::test]
    async fn test_session_invalid_signature() {
        let runner: KatanaRunner = KatanaRunner::load();
        // Initializing a prepared session account and master account
        let (mut session_account, ..) = create_session_account(&runner).await;

        // Setting an invalid session token
        let session = session_account.session_mut();
        let invalid_token = Signature {
            r: session.session_token()[1],
            s: FieldElement::from(0x2137u32),
        };
        session.set_token(invalid_token);

        // Calling the method not included in permitted
        let account = CartridgeAccount::new(session_account.address(), &session_account);
        let revoked_token = vec![FieldElement::from(0x2137u32), FieldElement::from(0x2137u32)];
        let result = account.revoke_session(&revoked_token).send().await;

        assert!(result.is_err(), "Signature verification should fail");
    }

    #[tokio::test]
    async fn test_session_revoked() {
        let runner = KatanaRunner::load();
        // Initializing a prepared session account
        let (session_account, ..) = create_session_account(&runner).await;
        let session_token = session_account.session().session_token().clone();
        let account = CartridgeAccount::new(session_account.address(), &session_account);

        // Letting the session revoke itself
        account.revoke_session(&session_token).send().await.unwrap();

        sleep(Duration::from_millis(200)).await;

        // The session should not be able to sign calls anymore
        let revoked_token = vec![FieldElement::from(0x2137u32), FieldElement::from(0x2137u32)];
        let result = account.revoke_session(&revoked_token).send().await;
        assert!(result.is_err(), "Session should be revoked");
    }

    #[tokio::test]
    async fn test_session_invalid_proof() {
        let runner: KatanaRunner = KatanaRunner::load();
        // Initializing a prepared session account and master account
        let (mut session_account, master_key, master_account) =
            create_session_account(&runner).await;

        // Setting a single allowed call, not including the one later called
        let permitted_calls = vec![Call {
            to: ContractAddress::from(session_account.address()),
            selector: selector!("validate_session"),
            calldata: vec![],
        }];

        // Signing the session
        let session = session_account.session_mut();
        let session_hash = session
            .set_policy(
                permitted_calls,
                master_account.chain_id(),
                master_account.address(),
            )
            .await
            .unwrap();

        let session_token = master_key.sign(&session_hash).unwrap();
        session.set_token(session_token);

        // Calling the method not included in permitted
        let account = CartridgeAccount::new(session_account.address(), &session_account);
        let revoked_token = vec![FieldElement::from(0x2137u32), FieldElement::from(0x2137u32)];
        let result = account.revoke_session(&revoked_token).send().await;

        assert!(result.is_err(), "Signature verification should fail");
    }

    #[tokio::test]
    async fn test_session_many_allowed() {
        let runner = KatanaRunner::load();
        // Initializing a prepared session account and master account
        let (mut session_account, master_key, master_account) =
            create_session_account(&runner).await;

        // Defining multiple allowed calls
        let to = ContractAddress::from(session_account.address());
        let session = session_account.session_mut();
        let permitted_calls = vec![
            Call {
                to,
                selector: selector!("revoke_session"),
                calldata: vec![],
            },
            Call {
                to,
                selector: selector!("validate_session"),
                calldata: vec![],
            },
            Call {
                to,
                selector: selector!("compute_root"),
                calldata: vec![],
            },
            Call {
                to,
                selector: selector!("not_yet_defined"),
                calldata: vec![],
            },
        ];
        let session_hash = session
            .set_policy(
                permitted_calls,
                master_account.chain_id(),
                master_account.address(),
            )
            .await
            .unwrap();

        let session_token = master_key.sign(&session_hash).unwrap();
        session.set_token(session_token);

        // Calling using the new session token
        let account = CartridgeAccount::new(session_account.address(), &session_account);

        let revoked_token = vec![FieldElement::from(0x2137u32), FieldElement::from(0x2137u32)];
        account.revoke_session(&revoked_token).send().await.unwrap();
    }

    #[tokio::test]
    async fn test_session_compute_proof() {
        let runner = KatanaRunner::load();
        let (master_account, _) =
            create_account(&runner.prefunded_single_owner_account().await).await;

        let address = master_account.address();
        let account = CartridgeAccount::new(address, &master_account);

        let cainome_address = ContractAddress::from(address);

        let call = Call {
            to: cainome_address,
            selector: selector!("revoke_session"),
            calldata: vec![],
        };

        let proof = account.compute_proof(&vec![call], &0).call().await.unwrap();

        assert_eq!(proof, vec![]);
    }

    #[tokio::test]
    async fn test_session_compute_root() {
        let runner = KatanaRunner::load();
        let (master_account, _) =
            create_account(&runner.prefunded_single_owner_account().await).await;

        let address = master_account.address();
        let account = CartridgeAccount::new(address, &master_account);

        let cainome_address = ContractAddress::from(address);

        let call = Call {
            to: cainome_address,
            selector: selector!("revoke_session"),
            calldata: vec![],
        };

        let root = account.compute_root(&call, &vec![]).call().await.unwrap();

        assert_ne!(root, felt!("0x0"));
    }
}
