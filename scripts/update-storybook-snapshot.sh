#!/bin/bash

# Check for required arguments
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <package-name> <port>"
  echo "Example: $0 @cartridge/keychain 6006"
  exit 1
fi

PACKAGE=$1
PORT=$2

# Extract the package name without @cartridge/ prefix
PACKAGE_NAME=$(echo $PACKAGE | sed 's/@cartridge\///')

# Run the test updates in container
docker run \
  --rm \
  --network="host" \
  -v "$(pwd)/packages/$PACKAGE_NAME/__image_snapshots__":/app/packages/$PACKAGE_NAME/__image_snapshots__ \
  -e DEBUG=true \
  --ipc=host \
  -ti \
  ghcr.io/cartridge-gg/controller/storybook-env:sha-a808942 \
  bash -c "pnpm i && pnpm --filter $PACKAGE test-storybook -u --url http://host.docker.internal:$PORT"

status=$?

# Kill storybook process by finding PID using port
if pid=$(lsof -ti:$PORT); then
  kill $pid || true
fi

exit $status
