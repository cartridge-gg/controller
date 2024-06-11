import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUrlTxns } from "hooks/transaction";
import { Transaction, TransactionState } from "components/Transaction";
import { TimerDuoIcon } from "@cartridge/ui";
import { Container, Banner, Content } from "components/layout";

function Pending() {
  const [txnResults, setTxnResults] = useState<TransactionState[]>([]);
  const [title, setTitle] = useState("Pending...");
  const [description, setDescription] = useState("This may take a second");

  const { chainId, txns } = useUrlTxns();

  useEffect(() => {
    if (txnResults.length > 0 && txnResults.length === txns.length) {
      const errors = txnResults.filter((state) => state === "error");
      if (errors.length > 0) {
        setTitle("Error");
        setDescription("Something went wrong");
        return;
      }

      setTitle("Success!");
      setDescription("Your transaction was successful");
    }

    //pending
  }, [txnResults, txns]);

  return (
    <Container>
      <Banner
        Icon={TimerDuoIcon}
        title={title}
        description={description}
      />

      <Content>
        {[...txns, { name: "name", hash: "hash" }].map((txn, idx) => (
          <Transaction
            key={idx}
            name={txn.name}
            chainId={chainId}
            hash={txn.hash}
            finalized={(state: TransactionState) => {
              setTxnResults([...txnResults, state]);
            }}
          />
        ))}
      </Content>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(Pending), { ssr: false });
