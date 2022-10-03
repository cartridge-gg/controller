import { ManagedTransaction, useTransactionManager } from '@starknet-react/core'

function TransactionItem({ transaction }: { transaction: ManagedTransaction<any> }) {
  return (
    <span>
      {JSON.stringify(transaction)}
      {/* {transaction.transactionHash} - {transaction.status} */}
    </span>
  )
}

export function TransactionList() {
  const { transactions } = useTransactionManager()
  return (
    <ul>
      {transactions.map((transaction, index) => (
        <li key={index}>
          <TransactionItem transaction={transaction} />
        </li>
      ))}
    </ul>
  )
}
