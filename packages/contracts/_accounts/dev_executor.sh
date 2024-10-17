source $(dirname "$0")/dev.sh

export STARKNET_ACCOUNT="$(dirname "$0")/dev_executor.json"
export STARKNET_KEYSTORE="$(dirname "$0")/dev_executor_keystore.json"
export ACCOUNT_PASS="executor"

