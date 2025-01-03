#!/bin/bash

# Run the container with all necessary options
docker run \
  --rm \
  -v "$(pwd)":/app \
  -v /app/node_modules \
  --ipc=host \
  storybook-env \
  bash -c "
    pnpm install --frozen-lockfile && \
    pnpm test:storybook:update
  "
