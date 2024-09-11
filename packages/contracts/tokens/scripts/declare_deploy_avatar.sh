#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

source ./scripts/.env.controller .

echo "--------------------------------"
echo "RPC     : " $STARKNET_RPC
echo "STARKNET_ACCOUNT : " $STARKNET_ACCOUNT
echo "STARKNET_ACCOUNT_KEYSTORE : " $STARKNET_ACCOUNT_KEYSTORE

export GENESIS_ACCOUNT_ADDRESS="0x6bd82a20984e638c8e1d45770e2924e274e315b9609eb15c26384eac0094cf1"
export GENESIS_ACCOUNT_PUBKEY="0x1deb38b95acca9ba74a218107ca0ec89f0d8ddf73d9bdecbd322f22bcc2eb45"

export EXECUTOR_PUB_KEY_ASIA="0x180ee4f1a9a0b27a444bf960822003a0748aa0cdd69f34c2792f42e13dc805e"
export EXECUTOR_PUB_KEY_EU="0x717642da0ea4a1dd4551404571b2ff9a4c256328f098e3276e027aeb37038e1"
export EXECUTOR_PUB_KEY_US="0x3acd845dff3a582501a330dec9865865ba3f8cced45c918f66ed5f2b538f082"



# scarb build -p tokens

# CLASS_HASH=$(starkli declare -w --rpc $STARKNET_RPC --account $STARKNET_ACCOUNT --keystore $STARKNET_ACCOUNT_KEYSTORE --keystore-password $STARKNET_ACCOUNT_PASSWORD  \
#  ../../../target/dev/tokens_AvatarNft.contract_class.json | tail -1)


export CLASS_HASH="0x00d06d6aacbedf00827827a34c0050298a834c53844519602104b9cdd21194a5"
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
    0x3 \
    $GENESIS_ACCOUNT_ADDRESS \
    0x1 $GENESIS_ACCOUNT_PUBKEY




