import NextHead from "next/head";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { CartridgeTheme } from "@cartridge/ui";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Inter, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  weight: "600",
  subsets: ["latin"],
});

import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});

import { useRouter } from "next/router";

export default function Keychain({ Component, pageProps }: AppProps) {
  useGlobalInjection();

  const router = useRouter();
  const { primary, secondary } = router.query;

  console.log(CartridgeTheme.colors)

  const customTheme = extendTheme({
    ...CartridgeTheme,
    colors: {
      ...CartridgeTheme.colors,
      // brand: {
      //   primary: (primary as string) || CartridgeTheme.colors.brand.primary,
      //   secondary:
      //     (secondary as string) || CartridgeTheme.colors.brand.secondary,
      // },
    },
  });

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

      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-ibm-plex-mono: ${ibmPlexMono.style.fontFamily};
        }

        body {
          background: var(--chakra-colors-translucent-lg);
        }
      `}</style>

      <ChakraProvider theme={customTheme}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ChakraProvider>
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
