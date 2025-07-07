import { PropsWithChildren } from "react";
import { DataProvider } from "./data";

export function Provider({ children }: PropsWithChildren) {
  // Profile is always rendered within keychain, so only provide minimal providers
  // since the main keychain already provides the connection infrastructure
  return <DataProvider>{children}</DataProvider>;
}
