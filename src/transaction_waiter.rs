use std::time::Duration;

use futures::{select, FutureExt};
use starknet::core::types::{
    ExecutionResult, FieldElement, MaybePendingTransactionReceipt, PendingTransactionReceipt,
    StarknetError, TransactionFinalityStatus, TransactionReceipt,
};
use starknet::providers::{Provider, ProviderError};

#[derive(Debug, thiserror::Error)]
pub enum TransactionWaitingError {
    #[error("request timed out")]
    Timeout,
    #[error("transaction reverted due to failed execution: {0}")]
    TransactionReverted(String),
    #[error(transparent)]
    Provider(ProviderError),
}

/// A type that waits for a transaction to achieve the desired status. The waiter will poll for the
/// transaction receipt every `interval` miliseconds until it achieves the desired status or until
/// `timeout` is reached.
///
/// The waiter can be configured to wait for a specific finality status (e.g, `ACCEPTED_ON_L2`), by
/// default, it only waits until the transaction is included in the _pending_ block. It can also be
/// set to check if the transaction is executed successfully or not (reverted).
///
/// # Examples
///
/// ```ignore
/// ues url::Url;
/// use starknet::providers::jsonrpc::HttpTransport;
/// use starknet::providers::JsonRpcClient;
/// use starknet::core::types::TransactionFinalityStatus;
///
/// let provider = JsonRpcClient::new(HttpTransport::new(Url::parse("http://localhost:5000").unwrap()));
///
/// let tx_hash = FieldElement::from(0xbadbeefu64);
/// let receipt = TransactionWaiter::new(tx_hash, &provider).with_finality(TransactionFinalityStatus::ACCEPTED_ON_L2).await.unwrap();
/// ```
#[must_use = "TransactionWaiter does nothing unless polled"]
pub struct TransactionWaiter<'a, P: Provider> {
    /// The hash of the transaction to wait for.
    tx_hash: FieldElement,
    /// The finality status to wait for.
    ///
    /// If set, the waiter will wait for the transaction to achieve this finality status.
    /// Otherwise, the waiter will only wait for the transaction until it is included in the
    /// _pending_ block.
    finality_status: Option<TransactionFinalityStatus>,
    /// A flag to indicate that the waited transaction must either be successfully executed or not.
    ///
    /// If it's set to `true`, then the transaction execution status must be `SUCCEEDED` otherwise
    /// an error will be returned. However, if set to `false`, then the execution status will not
    /// be considered when waiting for the transaction, meaning `REVERTED` transaction will not
    /// return an error.
    must_succeed: bool,
    /// Poll the transaction every `interval` miliseconds. Miliseconds are used so that
    /// we can be more precise with the polling interval. Defaults to 250ms.
    interval: Duration,
    /// The maximum amount of time to wait for the transaction to achieve the desired status. An
    /// error will be returned if it is unable to finish within the `timeout` duration. Defaults to
    /// 60 seconds.
    timeout: Duration,
    /// The provider to use for polling the transaction.
    provider: &'a P,
}

enum Sleeper {}

impl Sleeper {
    pub async fn sleep(delay: Duration) {
        #[cfg(not(target_arch = "wasm32"))]
        {
            tokio::time::sleep(delay).await;
        }
        #[cfg(target_arch = "wasm32")]
        {
            use wasm_bindgen::JsCast;
            use web_sys::WorkerGlobalScope;
            let mut cb = |resolve: js_sys::Function, _reject: js_sys::Function| {
                // if we are in a worker, use the global worker's scope
                // otherwise, use the window's scope
                if let Ok(worker_scope) = js_sys::global().dyn_into::<WorkerGlobalScope>() {
                    worker_scope
                        .set_timeout_with_callback_and_timeout_and_arguments_0(
                            &resolve,
                            delay.as_millis() as i32,
                        )
                        .expect("should register `setTimeout`");
                } else {
                    web_sys::window()
                        .unwrap()
                        .set_timeout_with_callback_and_timeout_and_arguments_0(
                            &resolve,
                            delay.as_millis() as i32,
                        )
                        .expect("should register `setTimeout`");
                }
            };
            let p = js_sys::Promise::new(&mut cb);
            wasm_bindgen_futures::JsFuture::from(p).await.unwrap();
        }
    }
}

#[allow(dead_code)]
impl<'a, P> TransactionWaiter<'a, P>
where
    P: Provider + Send + Sync,
{
    const DEFAULT_TIMEOUT: Duration = Duration::from_secs(300);
    const DEFAULT_INTERVAL: Duration = Duration::from_millis(2500);

    pub fn new(tx: FieldElement, provider: &'a P) -> Self {
        Self {
            provider,
            tx_hash: tx,
            must_succeed: true,
            finality_status: None,
            timeout: Self::DEFAULT_TIMEOUT,
            interval: Self::DEFAULT_INTERVAL,
        }
    }

    pub fn with_interval(self, milisecond: u64) -> Self {
        Self {
            interval: Duration::from_millis(milisecond),
            ..self
        }
    }

    pub fn with_finality(self, status: TransactionFinalityStatus) -> Self {
        Self {
            finality_status: Some(status),
            ..self
        }
    }

    pub fn with_timeout(self, timeout: Duration) -> Self {
        Self { timeout, ..self }
    }

    pub async fn wait(self) -> Result<MaybePendingTransactionReceipt, TransactionWaitingError> {
        let timeout = self.timeout;
        select! {
            result = self.wait_without_timeout().fuse() => result,
            _ = Sleeper::sleep(timeout).fuse() => Err(TransactionWaitingError::Timeout),
        }
    }
    async fn wait_without_timeout(
        self,
    ) -> Result<MaybePendingTransactionReceipt, TransactionWaitingError> {
        loop {
            let now = std::time::Instant::now();
            let transaction = self.provider.get_transaction_receipt(self.tx_hash).await;
            match transaction {
                Ok(receipt) => match &receipt {
                    MaybePendingTransactionReceipt::PendingReceipt(r) => {
                        if self.finality_status.is_none() {
                            if self.must_succeed {
                                return match execution_status_from_pending_receipt(r) {
                                    ExecutionResult::Succeeded => Ok(receipt),
                                    ExecutionResult::Reverted { reason } => {
                                        Err(TransactionWaitingError::TransactionReverted(
                                            reason.clone(),
                                        ))
                                    }
                                };
                            }
                            return Ok(receipt);
                        }
                    }

                    MaybePendingTransactionReceipt::Receipt(r) => {
                        if let Some(finality_status) = self.finality_status {
                            match finality_status_from_receipt(r) {
                                status if status == finality_status => {
                                    if self.must_succeed {
                                        return match execution_status_from_receipt(r) {
                                            ExecutionResult::Succeeded => Ok(receipt),
                                            ExecutionResult::Reverted { reason } => {
                                                Err(TransactionWaitingError::TransactionReverted(
                                                    reason.clone(),
                                                ))
                                            }
                                        };
                                    }
                                    return Ok(receipt);
                                }

                                _ => {}
                            }
                        } else {
                            return Ok(receipt);
                        }
                    }
                },

                Err(ProviderError::StarknetError(StarknetError::TransactionHashNotFound)) => {}

                Err(e) => {
                    return Err(TransactionWaitingError::Provider(e));
                }
            }
            Sleeper::sleep(self.interval.checked_sub(now.elapsed()).unwrap_or_default()).await;
        }
    }
}

#[inline]
fn execution_status_from_receipt(receipt: &TransactionReceipt) -> &ExecutionResult {
    match receipt {
        TransactionReceipt::Invoke(receipt) => &receipt.execution_result,
        TransactionReceipt::Deploy(receipt) => &receipt.execution_result,
        TransactionReceipt::Declare(receipt) => &receipt.execution_result,
        TransactionReceipt::L1Handler(receipt) => &receipt.execution_result,
        TransactionReceipt::DeployAccount(receipt) => &receipt.execution_result,
    }
}

#[inline]
fn execution_status_from_pending_receipt(receipt: &PendingTransactionReceipt) -> &ExecutionResult {
    match receipt {
        PendingTransactionReceipt::Invoke(receipt) => &receipt.execution_result,
        PendingTransactionReceipt::Declare(receipt) => &receipt.execution_result,
        PendingTransactionReceipt::L1Handler(receipt) => &receipt.execution_result,
        PendingTransactionReceipt::DeployAccount(receipt) => &receipt.execution_result,
    }
}

#[inline]
fn finality_status_from_receipt(receipt: &TransactionReceipt) -> TransactionFinalityStatus {
    match receipt {
        TransactionReceipt::Invoke(receipt) => receipt.finality_status,
        TransactionReceipt::Deploy(receipt) => receipt.finality_status,
        TransactionReceipt::Declare(receipt) => receipt.finality_status,
        TransactionReceipt::L1Handler(receipt) => receipt.finality_status,
        TransactionReceipt::DeployAccount(receipt) => receipt.finality_status,
    }
}

#[inline]
#[allow(dead_code)]
pub fn block_number_from_receipt(receipt: &TransactionReceipt) -> u64 {
    match receipt {
        TransactionReceipt::Invoke(tx) => tx.block_number,
        TransactionReceipt::L1Handler(tx) => tx.block_number,
        TransactionReceipt::Declare(tx) => tx.block_number,
        TransactionReceipt::Deploy(tx) => tx.block_number,
        TransactionReceipt::DeployAccount(tx) => tx.block_number,
    }
}
