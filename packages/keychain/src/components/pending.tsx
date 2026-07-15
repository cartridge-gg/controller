import { useEffect, useState } from "react";
import { useUrlTxns } from "@/hooks/transaction";
import { Transaction, TransactionState } from "@/components/Transaction";
import {
  LayoutContent,
  ClockIcon,
  HeaderInner,
} from "@cartridge/controller-ui";
import { useAdvancedView } from "@/hooks/features";

export function Pending() {
  const [txnResults, setTxnResults] = useState<TransactionState[]>([]);
  const [title, setTitle] = useState("Pending...");
  const [description, setDescription] = useState("This may take a second");
  const { chainId, txns } = useUrlTxns();
  const advancedView = useAdvancedView();

  useEffect(() => {
    if (txnResults.length > 0 && txnResults.length === txns.length) {
      const errors = txnResults.filter((state) => state === "error");
      if (errors.length > 0) {
        setTitle("Error");
        setDescription("Something went wrong");
        return;
      }

      setTitle("Success!");
      setDescription(
        advancedView
          ? "Your transaction was successful"
          : "Your request was successful",
      );
    }

    // pending
  }, [advancedView, txnResults, txns]);

  return (
    <>
      <HeaderInner
        icon={<ClockIcon variant="solid" size="lg" />}
        title={title}
        description={description}
        hideIcon
      />
      <LayoutContent>
        {chainId &&
          txns.map((txn, idx) => (
            <Transaction
              key={idx}
              name={txn.name}
              chainId={chainId}
              hash={txn.hash}
              finalized={(state: TransactionState) => {
                setTxnResults((current) => [...current, state]);
              }}
            />
          ))}
      </LayoutContent>
    </>
  );
}
