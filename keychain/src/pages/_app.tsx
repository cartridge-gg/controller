import type { AppProps } from "next/app";
import { CartridgeUIProvider } from "@cartridge/ui/theme/Provider";

import "../style.css";

function Keychain({ Component, pageProps }: AppProps) {
  return (
    <CartridgeUIProvider>
      <Component {...pageProps} />
    </CartridgeUIProvider>
  );
}

export default Keychain;
