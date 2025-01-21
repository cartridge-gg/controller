#!/bin/bash

# Check for required arguments
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <package-name> <port>"
  echo "Example: $0 @cartridge/keychain 6006"
  exit 1
fi

PACKAGE=$1
PORT=$2

# Run the test updates in container
docker run \
  --rm \
  --network="host" \
  -v "$(pwd)":/app \
  -v /app/node_modules \
  --ipc=host \
  -ti \
  ghcr.io/cartridge-gg/controller/storybook-env:sha-6d7b370 \
  bash -c "pnpm i && pnpm --filter $PACKAGE test-storybook -u --url http://host.docker.internal:$PORT"
