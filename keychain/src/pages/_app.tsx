import type { AppProps } from 'next/app'
import { CartridgeUIProvider } from "@cartridge/ui/theme/Provider";

function Keychain({ Component, pageProps }: AppProps) {
  return (
    <CartridgeUIProvider>
      <Component {...pageProps} />
    </CartridgeUIProvider>
  )
}

export default Keychain
