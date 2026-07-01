// Single source of truth for the toast wire-protocol types lives with the
// keychain emitter at `@/components/primitives/toast/types`. We re-export it
// here so <ControllerToaster /> (the receiver) and the keychain (the emitter)
// can never drift apart, while keeping the local `./types` import path stable.
// Types are erased at build time, so this adds nothing to the `/ui` bundle.
export * from "@/components/primitives/toast/types";
