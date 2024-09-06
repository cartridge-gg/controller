#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

source ./scripts/.env.controller .

echo "--------------------------------"
echo "RPC     : " $RPC_URL
echo "ACCOUNT : " $ACCOUNT
echo "ACCOUNT_KEYSTORE : " $ACCOUNT_KEYSTORE


CLASS_HASH=$(starkli declare -w --rpc $RPC_URL --account $ACCOUNT --keystore $ACCOUNT_KEYSTORE --keystore-password $ACCOUNT_PASSWORD  \
 ../../../target/dev/tokens_AvatarNft.contract_class.json | tail -1)


echo "CLASS_HASH : " $CLASS_HASH

# export CLASS_HASH="0x02df5bca656ab7070c233c2e46a200421e2666e7a425a740e075bceb2ab05bf8"

CONTRACT_ADDRESS=$(starkli deploy -w --rpc $RPC_URL --account $ACCOUNT --keystore $ACCOUNT_KEYSTORE --keystore-password $ACCOUNT_PASSWORD $CLASS_HASH \
 $ACCOUNT_ADDRESS $ACCOUNT_ADDRESS | 
tail -1)

echo "CONTRACT_ADDRESS : " $CONTRACT_ADDRESS

# export CONTRACT_ADDRESS="0x02015f554d4cedd37506e789d5fcd9178774b96096e8acde7ae657c79bceed61"

