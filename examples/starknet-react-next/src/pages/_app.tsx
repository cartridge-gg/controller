import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import { StarknetProvider } from '@starknet-react/core'
import CartridgeConnector from '~/../../../connector/src'
import { RpcProvider } from 'starknet'

const connectors = [new CartridgeConnector(null, { url: process.env.XFRAME_URL })]

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StarknetProvider autoConnect connectors={connectors} defaultProvider={new RpcProvider({ nodeUrl: "https://starknet-goerli.cartridge.gg/rpc/v0.2" })}>
      <NextHead>
        <title>StarkNet ❤️ React</title>
      </NextHead>
      <Component {...pageProps} />
    </StarknetProvider>
  )
}

export default MyApp
