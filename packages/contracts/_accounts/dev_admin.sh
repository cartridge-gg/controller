
source $(dirname "$0")/dev.sh

export STARKNET_ACCOUNT="$(dirname "$0")/dev_admin.json"
export STARKNET_KEYSTORE="$(dirname "$0")/dev_admin_keystore.json"
export ACCOUNT_PASS="admin"

echo $STARKNET_KEYSTORE