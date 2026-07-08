import { cartridgeTWPreset } from "@cartridge/controller-ui/preset";

// Config for the precompiled `@cartridge/controller/react/styles.css`.
// - presets: the cartridge design tokens (maps bg-background → var(--…), etc.)
// - preflight off: this is a drop-in component stylesheet, it must NOT reset
//   the host page (the --tw-* defaults are still emitted so shadows/transforms
//   keep working).
// - content: the BUNDLED ui chunk, so only classes actually shipped by
//   <ControllerToaster /> are generated.
/** @type {import('tailwindcss').Config} */
export default {
  presets: [cartridgeTWPreset],
  corePlugins: { preflight: false },
  content: ["dist/react/index.js"],
};
