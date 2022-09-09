import type { AppProps } from 'next/app'

if (typeof window !== "undefined") {
  (window.XMLHttpRequest as any) = undefined;
  (window.fetch as any) = undefined;
}

function Keychain({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default Keychain
