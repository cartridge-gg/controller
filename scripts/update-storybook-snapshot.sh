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

# Check if storybook is running on the specified port
if ! nc -z localhost $PORT; then
  echo "Starting Storybook on port $PORT..."
  pnpm --filter $PACKAGE storybook -p $PORT &
  # Wait for storybook to start
  while ! nc -z localhost $PORT; do
    sleep 1
  done
fi

# Run the test updates in container
docker run \
  --rm \
  --network="host" \
  -v "$(pwd)/packages/$PACKAGE_NAME/__image_snapshots__":/app/packages/$PACKAGE_NAME/__image_snapshots__ \
  -e DEBUG=true \
  --ipc=host \
  -ti \
  ghcr.io/cartridge-gg/controller/storybook-env:sha-db7f70d \
  bash -c "pnpm i && pnpm --filter $PACKAGE test-storybook -u --url http://host.docker.internal:$PORT"

status=$?

# Kill storybook process by finding PID using port
if pid=$(lsof -ti:$PORT); then
  kill $pid || true
fi

exit $status
