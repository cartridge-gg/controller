import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { CartridgeUIProvider } from "@cartridge/ui/theme/Provider";

import "../style.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});

function Keychain({ Component, pageProps }: AppProps) {
  return (
    <CartridgeUIProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </CartridgeUIProvider>
  );
}

export default Keychain;
