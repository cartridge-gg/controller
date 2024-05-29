import NextHead from "next/head";
import type { AppProps } from "next/app";
import { CartridgeTheme } from "@cartridge/ui";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { Provider } from "components/Provider";
import { RpcProvider } from "starknet";

const inter = Inter({ subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  weight: "600",
  subsets: ["latin"],
});

export default function Keychain({
  Component,
  pageProps,
}: AppProps<{ rpcUrl: string }>) {
  useGlobalInjection();

  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChainId = async () => {
      let rpcUrl: string | undefined;

      if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        rpcUrl = urlParams.get("rpcUrl");
      }

      if (!rpcUrl) {
        setError(new Error("rpcUrl is not provided in the query parameters"));
        return;
      }

      try {
        const rpc = new RpcProvider({ nodeUrl: rpcUrl });
        const chainId = (await rpc.getChainId()) as string;
        setChainId(chainId);
      } catch (error) {
        setError(new Error("Unable to fetch Chain ID from provided RPC URL"));
      }
    };

    fetchChainId();
  }, []);

  return (
    <>
      <NextHead>
        <title>Cartridge Controller</title>

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
      </NextHead >

      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-ibm-plex-mono: ${ibmPlexMono.style.fontFamily};
        }

        body {
          background: var(--chakra-colors-solid-bg);
        }
      `}</style>

      <Provider>
        {error ? error.message : <Component chainId={chainId} {...pageProps} />}
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
