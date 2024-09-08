#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

source ./scripts/.env.controller .

echo "--------------------------------"
echo "RPC     : " $STARKNET_RPC
echo "STARKNET_ACCOUNT : " $STARKNET_ACCOUNT
echo "STARKNET_ACCOUNT_KEYSTORE : " $STARKNET_ACCOUNT_KEYSTORE

scarb build -p tokens

CLASS_HASH=$(starkli declare -w --rpc $STARKNET_RPC --account $STARKNET_ACCOUNT --keystore $STARKNET_ACCOUNT_KEYSTORE --keystore-password $STARKNET_ACCOUNT_PASSWORD  \
 ../../../target/dev/tokens_AvatarNft.contract_class.json | tail -1)


echo "CLASS_HASH : " $CLASS_HASH

# CONTRACT_ADDRESS=$(starkli deploy -w --rpc $STARKNET_RPC --account $STARKNET_ACCOUNT --keystore $STARKNET_ACCOUNT_KEYSTORE --keystore-password $STARKNET_ACCOUNT_PASSWORD $CLASS_HASH \
#  $STARKNET_ACCOUNT_ADDRESS $STARKNET_ACCOUNT_ADDRESS | 
# tail -1)

# echo "CONTRACT_ADDRESS : " $CONTRACT_ADDRESS

starkli invoke $UDC_ADDRESS -w  --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT \
    --keystore $STARKNET_ACCOUNT_KEYSTORE \
    --keystore-password $STARKNET_ACCOUNT_PASSWORD \
    deployContract \
    $CLASS_HASH \
    0x0 \
    0x0 \
    0x2 \
    $STARKNET_ACCOUNT_ADDRESS $STARKNET_ACCOUNT_ADDRESS


