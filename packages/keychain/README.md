# Keychain

The Cartridge Keychain is a small, sandboxed web application built with Expo
that manages interactions with the users credentials in a secure, self-custodial
manner.

## Development

### Web Development

```
pnpm keychain dev:web
```

### Mobile Development

```
pnpm keychain dev
```

### Build

```
pnpm keychain build:web  # For web
pnpm keychain build      # For all platforms
```

## Migration to Expo

This package has been migrated from Vite to Expo to support both web and mobile
platforms. Key changes:

- Added `app.json` for Expo configuration
- Created `app/index.tsx` as the Expo entry point
- Added `metro.config.cjs` for Metro bundler configuration
- Updated package.json scripts to use Expo CLI
- Added Expo dependencies to the workspace catalog
