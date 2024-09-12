
#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

echo "---------------------------------"
echo $STARKNET_RPC
echo $STARKNET_ACCOUNT
echo $STARKNET_KEYSTORE
echo $ACCOUNT_PASS
echo "---------------------------------"
echo "REGISTRY ADDRESS : " $REGISTRY_ADDRESS
echo "RESOLVER ADDRESS : " $RESOLVER_ADDRESS
echo "---------------------------------"
