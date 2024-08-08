## Controller Example (Next.js)

### Development

```
pnpm i
pnpm dev

# Example page: localhost:3002
# Keychain: localhost:3001
```

### E2E test

```sh
# Start api server locally
bin/apidev

# Start example page and keychain
pnpm dev

# Run test
pnpm example:next e2e

# or Run test with Playwright UI
pnpm example:next e2e:ui
```
