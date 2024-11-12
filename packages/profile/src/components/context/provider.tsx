import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "./theme";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/utils/api/indexer";
import { DataProvider } from "./data";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.VITE_POSTHOG_KEY!, {
    api_host: process.env.VITE_POSTHOG_HOST,
    person_profiles: "always",
    enable_recording_console_log: true,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
  });
}

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <PostHogProvider client={posthog}>
      <BrowserRouter>
        <ThemeProvider defaultScheme="system">
          <CartridgeAPIProvider
            url={`${import.meta.env.VITE_CARTRIDGE_API_URL!}/query`}
          >
            <IndexerAPIProvider credentials="omit">
              <QueryClientProvider client={queryClient}>
                <ConnectionProvider>
                  <DataProvider>{children}</DataProvider>
                </ConnectionProvider>
              </QueryClientProvider>
            </IndexerAPIProvider>
          </CartridgeAPIProvider>
        </ThemeProvider>
      </BrowserRouter>
    </PostHogProvider>
  );
}
