import type { AppProps } from 'next/app'
import { CartridgeUIProvider } from "@cartridge/ui/theme/Provider";

// if (process.env.NODE_ENV == "production" && typeof window !== "undefined") {
//   (window.XMLHttpRequest as any) = undefined;
//   (window.fetch as any) = undefined;
// }

function Keychain({ Component, pageProps }: AppProps) {
  return (
    <CartridgeUIProvider>
      <Component {...pageProps} />
    </CartridgeUIProvider>
  )
}

export default Keychain
