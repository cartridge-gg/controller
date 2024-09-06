#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

source ./scripts/.env.controller .


starkli invoke -w --rpc $RPC_URL --account $ACCOUNT --keystore $ACCOUNT_KEYSTORE --keystore-password $ACCOUNT_PASSWORD $AVATAR_CONTRACT_ADDRESS mint \
  $1 u256:$1 0