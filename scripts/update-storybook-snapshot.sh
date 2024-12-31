#!/bin/bash

# Run the container with all necessary options
docker run \
  --rm \
  -v "$(pwd)":/app \
  -v /app/node_modules \
  -it \
  ghcr.io/cartridge-gg/controller/storybook-env:sha-b6d96629787539de6f5e464aafedafd4eb3ffcc7 \
  bash -c "
    pnpm install --frozen-lockfile && \
    pnpm test:storybook:update
  "
