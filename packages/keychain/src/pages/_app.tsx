import NextHead from "next/head";
import { CartridgeTheme } from "@cartridge/ui";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { CartridgeUIProvider } from "@cartridge/ui";

import "../style.css";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});

export default function Keychain({ Component, pageProps }: AppProps) {
  useGlobalInjection();

  return (
    <>
      <NextHead>
        <title>Cartridge</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:creator" content="@cartridge_gg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="cartridge" />
        <meta property="theme-color" content={CartridgeTheme.colors.brand} />
      </NextHead>
      <CartridgeUIProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </CartridgeUIProvider>
    </>
  );
}

function useGlobalInjection() {
  useEffect(() => {
    window.cartridge = {
      ...window.cartridge,
      exportAccount() {
        return JSON.stringify(window.localStorage);
      },
      importAccount(accountDump) {
        Object.entries(
          JSON.parse(accountDump) as Record<string, string>,
        ).forEach(([key, value]) => window.localStorage.setItem(key, value));
      },
    };
  }, []);
}

declare global {
  interface Window {
    cartridge: {
      exportAccount: () => string;
      importAccount: (accountDump: string) => void;
    };
  }
}
