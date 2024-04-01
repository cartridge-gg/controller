import type { AppProps } from "next/app";
import NextHead from "next/head";
import { StarknetProvider } from "components/StarknetProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StarknetProvider>
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
