#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:8001/x/starknet/sepolia"
export ACCOUNT="../../../../../cartridge/account.json"
export ACCOUNT_KEYSTORE="../../../../../cartridge/keystore"

export UDC_ADDRESS="0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"

export OWNER_ADDRESS="0x"

export EXECUTOR_PUB_KEY_ASIA="0x180ee4f1a9a0b27a444bf960822003a0748aa0cdd69f34c2792f42e13dc805e"
export EXECUTOR_PUB_KEY_EU="0x717642da0ea4a1dd4551404571b2ff9a4c256328f098e3276e027aeb37038e1"
export EXECUTOR_PUB_KEY_US="0x3acd845dff3a582501a330dec9865865ba3f8cced45c918f66ed5f2b538f082"

export RESOLVER_CLASS_HASH="0x"


starkli invoke $UDC_ADDRESS -w --account $ACCOUNT \
    --rpc $RPC_URL \
    --keystore $ACCOUNT_KEYSTORE \
    --keystore-password apidev \
    deployContract \
    $RESOLVER_CLASS_HASH \
    0x0 \
    0x0 \
    0x5 \
    $OWNER_ADDRESS \
    0x3 $EXECUTOR_PUB_KEY_US $EXECUTOR_PUB_KEY_EU $EXECUTOR_PUB_KEY_ASIA \


