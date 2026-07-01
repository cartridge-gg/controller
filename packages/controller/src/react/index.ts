// Public React subpath for `@cartridge/controller/react`.
//
// Re-exports the toast receiver component from the in-repo UI library. This
// entry is built as its own Vite chunk (dist/react/index.js) and is never
// imported by the SDK entry (dist/index.js), so apps that only import
// `@cartridge/controller` pay no extra footprint — the React/UI dependencies
// are pulled in only when an app explicitly imports `@cartridge/controller/react`.
//
// The public types below are declared locally (and only reference `react`, an
// optional peer dependency that `/ui` consumers already have) rather than
// re-exported from `@cartridge/controller-ui`. That package is bundled into the
// chunk at build time but is NOT a runtime dependency, so re-exporting its types
// would leave the published `.d.ts` pointing at a module npm consumers don't
// have installed. The value import below is erased from the generated `.d.ts`.
//
// Styling ships separately as `@cartridge/controller/react/styles.css`.
import type { ReactElement } from "react";
import { ControllerToaster as ControllerToasterImpl } from "@cartridge/controller-ui/controller-react";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export type ControllerNotificationTypes =
  | "error"
  | "success"
  | "network"
  | "transaction"
  | "marketplace"
  | "achievement"
  | "user";

export interface ControllerToasterProps {
  position?: ToastPosition;
  disabledTypes?: ControllerNotificationTypes[];
  collapseTransactions?: boolean;
  toasterId?: string;
}

// The assignment (no cast) asserts the bundled component stays structurally
// compatible with the public prop type above — the build fails if they drift.
export const ControllerToaster: (
  props: ControllerToasterProps,
) => ReactElement = ControllerToasterImpl;
