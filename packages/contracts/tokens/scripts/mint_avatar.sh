#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

source ./scripts/.env.controller .


starkli invoke -w --rpc $STARKNET_RPC --account $STARKNET_ACCOUNT --keystore $STARKNET_ACCOUNT_KEYSTORE --keystore-password $STARKNET_ACCOUNT_PASSWORD $AVATAR_CONTRACT_ADDRESS mint \
  $1 u256:$1