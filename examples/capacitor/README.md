# Cartridge + Capacitor Session Example

This example shows how to create and use a Controller session inside a
Capacitor app. It uses the web session provider and opens the authorization
URL in the system browser on native platforms.

## Setup

From the repo root:

```bash
pnpm install
```

Run the web version:

```bash
pnpm -C examples/capacitor dev
```

Build for Capacitor:

```bash
pnpm -C examples/capacitor build
```

Initialize native projects (first time):

```bash
pnpm -C examples/capacitor exec -- cap add ios
pnpm -C examples/capacitor exec -- cap add android
```

Sync updates after builds:

```bash
pnpm -C examples/capacitor exec -- cap sync
```

## Live reload on device

The Capacitor CLI expects the dev server on port 3000 by default. This example
configures Vite to use port 3000, so just run:

```bash
pnpm -C examples/capacitor dev
pnpm -C examples/capacitor exec -- cap run ios -l --external
```

## Deep link setup (required for session redirect)

The session flow redirects back to the app using the custom scheme
`cartridge-session://session`.

### iOS

1. Open the iOS project: `pnpm -C examples/capacitor exec -- cap open ios`
2. In Xcode, select the App target → **Info** → **URL Types**
3. Add a new URL type with **URL Schemes** set to `cartridge-session`

### Android

Add an intent filter for the custom scheme in
`android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
  <action android:name=\"android.intent.action.VIEW\" />
  <category android:name=\"android.intent.category.DEFAULT\" />
  <category android:name=\"android.intent.category.BROWSABLE\" />
  <data android:scheme=\"cartridge-session\" android:host=\"session\" />
</intent-filter>
```

## Notes

- The provider opens the session URL with `window.open`. In native builds we
  intercept it with `@capacitor/browser` to ensure the system browser opens.
- After authorizing the session in the browser, return to the app to complete
  the flow.
