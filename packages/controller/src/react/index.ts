// Public React subpath for `@cartridge/controller/react`.
//
// Re-exports the toast receiver component from the in-repo UI library. This
// entry is built as its own Vite chunk (dist/react/index.js) and is never
// imported by the SDK entry (dist/index.js), so apps that only import
// `@cartridge/controller` pay no extra footprint — the React/UI dependencies
// are pulled in only when an app explicitly imports `@cartridge/controller/react`.
//
// The public types are re-exported from `@cartridge/controller-ui` (their
// single declaration site) rather than re-declared here. That package is
// bundled into the chunk at build time and is NOT a runtime dependency, so
// the build rolls the re-exported declarations up into a self-contained
// `.d.ts` (see `rollupTypes`/`bundledPackages` in vite.config.js) — the
// published types never reference a module npm consumers don't have.
//
// Styling ships separately as `@cartridge/controller/react/styles.css`.
import type { ReactElement } from "react";
import type {
  ControllerNotificationTypes,
  ToastPosition,
} from "@cartridge/controller-ui/controller-react";
import { ControllerToaster as ControllerToasterImpl } from "@cartridge/controller-ui/controller-react";

export type { ControllerNotificationTypes, ToastPosition };

// Curated public props: a narrow subset of the bundled component's full prop
// type (which also spreads sonner's Toaster props — internal detail).
export interface ControllerToasterProps {
  position?: ToastPosition;
  duration?: number;
  disabledTypes?: ControllerNotificationTypes[];
  collapseTransactions?: boolean;
}

// The assignment (no cast) asserts the bundled component stays structurally
// compatible with the public prop type above — the build fails if they drift.
export const ControllerToaster: (
  props: ControllerToasterProps,
) => ReactElement = ControllerToasterImpl;
