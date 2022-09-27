import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import { StarknetProvider } from '@starknet-react/core'
import CartridgeConnector from '~/../../../connector/src'

const connectors = [new CartridgeConnector(null, { url: process.env.XFRAME_URL })]

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StarknetProvider autoConnect connectors={connectors}>
      <NextHead>
        <title>StarkNet ❤️ React</title>
      </NextHead>
      <Component {...pageProps} />
    </StarknetProvider>
  )
}

export default MyApp
