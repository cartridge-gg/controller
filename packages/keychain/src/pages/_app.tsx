import NextHead from "next/head";
import type { AppProps } from "next/app";
import { CartridgeTheme } from "@cartridge/ui";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { useEffect } from "react";
import { Provider } from "components/Provider";
import { ErrorBoundary } from "components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  weight: "600",
  subsets: ["latin"],
});

export default function Keychain({ Component, pageProps }: AppProps) {
  useGlobalInjection();

  return (
    <>
      <NextHead>
        <title>Cartridge Controller</title>

        <link
          rel="icon"
          type="image/png"
          href="/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Controller" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:creator" content="@cartridge_gg" />
        <meta property="twitter:title" content="Cartridge Controller" />
        <meta
          property="twitter:description"
          content="Controller is a gaming specific smart contract wallet that enables seamless player onboarding and game interactions."
        />
        <meta property="twitter:image" content="/cover.png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="cartridge" />
        <meta property="og:title" content="Cartridge Controller" />
        <meta
          property="og:description"
          content="Controller is a gaming specific smart contract wallet that enables seamless player onboarding and game interactions."
        />
        <meta property="og:image" content="/cover.png" />
        <meta
          property="theme-color"
          content={CartridgeTheme.semanticTokens.colors.brand}
        />
      </NextHead>

      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-ibm-plex-mono: ${ibmPlexMono.style.fontFamily};
        }

        body {
          background: var(--chakra-colors-solid-bg);
        }

        html,
        body {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        body::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>

      <Provider>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Provider>
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
