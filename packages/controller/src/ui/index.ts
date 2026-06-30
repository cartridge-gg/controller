// Public UI subpath for `@cartridge/controller/ui`.
//
// Re-exports the toast receiver component (and the prop types needed to
// configure it) from the in-repo UI library. This entry is built as its own
// Vite chunk (dist/ui/index.js) and is never imported by the SDK entry
// (dist/index.js), so apps that only import `@cartridge/controller` pay no
// extra footprint — the React/UI dependencies are pulled in only when an app
// explicitly imports `@cartridge/controller/ui`.
//
// Styling ships separately as `@cartridge/controller/ui/styles.css`.
export { ControllerToaster } from "@cartridge/controller-ui/controller-export";
export type {
  ControllerNotificationTypes,
  ToastPosition,
} from "@cartridge/controller-ui/controller-export";
