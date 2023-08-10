import type { AppProps } from "next/app";
import NextHead from "next/head";
import { StarknetProvider } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { RpcProvider } from "starknet";

const url =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? `https://keychain-git-${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}.preview.cartridge.gg`
        .replace("(", "")
        .replace(")/", "-") // e.g. `feat(keychain)/branch-name` -> `featkeychain-branch-name`
    : process.env.XFRAME_URL;
const connectors = [
  new CartridgeConnector([{ target: "0xdeadbeef", method: "testMethod" }], {
    url,
  }),
];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StarknetProvider
      autoConnect
      connectors={connectors}
      defaultProvider={
        new RpcProvider({
          nodeUrl: process.env.NEXT_PUBLIC_RPC_GOERLI,
        })
      }
    >
      <NextHead>
        <title>StarkNet ❤️ React</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
      </NextHead>
      <Component {...pageProps} />
    </StarknetProvider>
  );
}

export default MyApp;
