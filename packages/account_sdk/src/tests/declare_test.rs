use starknet::accounts::Account;
use starknet::signers::SigningKey;

use crate::account::session::create::SessionCreator;
use crate::account::session::hash::AllowedMethod;
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
    let controller = runner
        .deploy_controller("username".to_owned(), signer, Version::LATEST)
        .await;

    let session = controller
        .account
        .session_account(
            Signer::Starknet(SigningKey::from_random()),
            vec![AllowedMethod {
                contract_address: controller.address(),
                selector: DECLARATION_SELECTOR,
            }],
            u64::MAX,
        )
        .await
        .unwrap();

    AccountDeclaration::erc_20(runner.client())
        .declare(&session)
        .await
        .unwrap()
        .wait_for_completion()
        .await;
}
