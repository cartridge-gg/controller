#!/bin/bash

# Run the container with all necessary options
docker run \
  --rm \
  -v "$(pwd)":/app \
  -v "$(pwd)"/node_modules:/app/node_modules \
  --ipc=host \
  ghcr.io/cartridge-gg/controller/storybook-env:sha-91a2d36 \
  bash -c "
    pnpm install --frozen-lockfile && \
    pnpm test:storybook:update
  "
