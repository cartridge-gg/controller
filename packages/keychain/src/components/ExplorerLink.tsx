import { useAdvanced } from "@/context/advanced";
import { useExplorer } from "@starknet-react/core";
import { Link } from "react-router-dom";

export function ExplorerTransactionLink({
  transactionHash,
  children,
}: {
  transactionHash: string;
  children: React.ReactNode;
}) {
  const { advanced } = useAdvanced();
  const explorer = useExplorer();

  if (!advanced) {
    return <>{children}</>;
  }

  return (
    <Link to={explorer.transaction(transactionHash)} target="_blank">
      {children}
    </Link>
  );
}
