import { useAccount, useStarknetCall, useStarknetInvoke } from '@starknet-react/core'
import type { NextPage } from 'next'
import { useCallback, useMemo, useState } from 'react'
import { number, uint256 } from 'starknet'
import { ConnectWallet } from '~/components/ConnectWallet'
import { TransactionList } from '~/components/TransactionList'
import { useTokenContract } from '~/hooks/token'

function UserBalance() {
  const { account } = useAccount()
  const { contract } = useTokenContract()

  const { data, loading, error } = useStarknetCall({
    contract,
    method: 'balanceOf',
    args: account ? [account] : undefined,
  })

  const content = useMemo(() => {
    if (loading || !data?.length) {
      return <div>Loading balance</div>
    }

    if (error) {
      return <div>Error: {error}</div>
    }

    const balance = uint256.uint256ToBN(data[0])
    return <div>{balance.toString(10)}</div>
  }, [data, loading, error])

  return (
    <div>
      <h2>User balance</h2>
      {content}
    </div>
  )
}

function MintToken() {
  const { account } = useAccount()
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | undefined>()

  const { contract } = useTokenContract()

  const { loading, error, reset, invoke } = useStarknetInvoke({ contract, method: 'mint' })

  const updateAmount = useCallback(
    (newAmount: string) => {
      // soft-validate amount
      setAmount(newAmount)
      try {
        number.toBN(newAmount)
        setAmountError(undefined)
      } catch (err) {
        console.error(err)
        setAmountError('Please input a valid number')
      }
    },
    [setAmount]
  )

  const onMint = useCallback(() => {
    reset()
    if (account && !amountError) {
      const amountBn = uint256.bnToUint256(amount)
      invoke({ args: [account, amountBn] })
    }
  }, [account, amount])

  const mintButtonDisabled = useMemo(() => {
    if (loading) return true
    return !account || !!amountError
  }, [loading, account, amountError])

  return (
    <div>
      <h2>Mint token</h2>
      <p>
        <span>Amount: </span>
        <input type="number" onChange={(evt) => updateAmount(evt.target.value)} />
      </p>
      <button disabled={mintButtonDisabled} onClick={onMint}>
        {loading ? 'Waiting for wallet' : 'Mint'}
      </button>
      {error && <p><>Error: {error}</></p>}
    </div>
  )
}

const TokenPage: NextPage = () => {
  const { address } = useAccount()

  if (!address) {
    return (
      <div>
        <p>Connect Wallet</p>
        <ConnectWallet />
      </div>
    )
  }
  return (
    <div>
      <p>Connected: {address}</p>
      <UserBalance />
      <MintToken />
      <TransactionList />
    </div>
  )
}

export default TokenPage
