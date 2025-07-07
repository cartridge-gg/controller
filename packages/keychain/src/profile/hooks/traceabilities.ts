export interface CardProps {
  key: string;
  username: string;
  timestamp: number;
  category: "send" | "receive" | "mint" | "sale" | "list";
  amount: number;
  transactionHash: string;
  currencyImage?: string;
}

export function useTraceabilities({
  contractAddress: _,
  tokenId: __,
}: {
  contractAddress: string;
  tokenId: string;
}) {
  // TODO: Implement traceabilities fetching
  const traceabilities: CardProps[] = [];
  const status = "success";

  return {
    traceabilities,
    status,
  };
}
