import type { AppProps } from "next/app";
import { CartridgeUIProvider } from "@cartridge/ui/theme/Provider";

import "../style.css";
import { useEffect } from "react";
import Storage from "utils/storage";

const VERSION = "0.0.1";

function Keychain({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const version = Storage.get("version");
    if (!!version) {
      return;
    }

    Storage.clear();
    Storage.set("version", VERSION);
  }, []);

  return (
    <CartridgeUIProvider>
      <Component {...pageProps} />
    </CartridgeUIProvider>
  );
}

export default Keychain;
