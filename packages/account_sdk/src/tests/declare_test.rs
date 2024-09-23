use starknet::accounts::Account;

use crate::account::session::hash::Policy;
use crate::account::DECLARATION_SELECTOR;
use crate::constants::Version;
use crate::signers::Signer;
use crate::tests::account::AccountDeclaration;

use crate::tests::runners::katana::KatanaRunner;

#[tokio::test]
async fn test_declare_with_account() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    AccountDeclaration::erc_20(runner.client())
        .declare(&controller)
        .await
        .unwrap()
        .wait_for_completion()
        .await;
}

#[tokio::test]
async fn test_declare_with_session() {
    let signer = Signer::new_starknet_random();
    let runner = KatanaRunner::load();
    let mut controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let session_account = controller
        .create_session(
            vec![Policy {
                contract_address: controller.address(),
                selector: DECLARATION_SELECTOR,
            }],
            u64::MAX,
        )
        .await
        .unwrap();

    AccountDeclaration::erc_20(runner.client())
        .declare(&session_account)
        .await
        .unwrap()
        .wait_for_completion()
        .await;
}
