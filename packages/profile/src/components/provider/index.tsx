import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ArcadeProvider } from "./arcade";
import { ThemeProvider } from "./theme";
import { ConnectionProvider } from "./connection";
import { CartridgeAPIProvider } from "@cartridge/ui/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/ui/utils/api/indexer";
import { DataProvider } from "./data";
import { PostHogContext, PostHogWrapper } from "@cartridge/ui/utils";
import { UIProvider } from "./ui";

const posthog = new PostHogWrapper(import.meta.env.VITE_POSTHOG_KEY!, {
  host: import.meta.env.VITE_POSTHOG_HOST,
  autocapture: true,
});

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <PostHogContext.Provider value={{ posthog }}>
      <CartridgeAPIProvider
        url={`${import.meta.env.VITE_CARTRIDGE_API_URL!}/query`}
      >
        <IndexerAPIProvider credentials="omit">
          <QueryClientProvider client={queryClient}>
            <ArcadeProvider>
              <ConnectionProvider>
                <UIProvider>
                  <ThemeProvider defaultScheme="system">
                    <DataProvider>{children}</DataProvider>
                  </ThemeProvider>
                </UIProvider>
              </ConnectionProvider>
            </ArcadeProvider>
          </QueryClientProvider>
        </IndexerAPIProvider>
      </CartridgeAPIProvider>
    </PostHogContext.Provider>
  );
}
