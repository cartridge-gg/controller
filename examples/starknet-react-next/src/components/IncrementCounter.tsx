import React from 'react'
import { useAccount, useStarknetInvoke } from '@starknet-react/core'
import { useCounterContract } from '~/hooks/counter'

export function IncrementCounter() {
  const { account } = useAccount()
  const { contract: counter } = useCounterContract()
  const { invoke } = useStarknetInvoke({ contract: counter, method: 'incrementCounter' })

  if (!account) {
    return null
  }

  return (
    <div>
      <button onClick={() => invoke({ args: ['0x1'] })}>Increment Counter by 1</button>
    </div>
  )
}
