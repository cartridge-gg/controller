import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom/client";
import { connect } from "get-starknet";
import { injectController } from "@cartridge/controller";
import { AccountInterface } from "starknet";

injectController(undefined, {
  starterPackId: "briq",
  chainId: "0x534e5f4d41494e" as any,
});

const Main = () => {
  const [account, setAccount] = useState<AccountInterface>();

  const onConnect = useCallback(async () => {
    const controller = await connect();
    setAccount(controller);
  }, []);

  const onIncrement = useCallback(() => {
    account.execute([
      {
        contractAddress:
          "0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1",
        entrypoint: "incrementCounter",
        calldata: ["0x1"],
      },
    ]);
  }, [account]);

  return (
    <div>
      {!account && <button onClick={onConnect}>connect</button>}
      {account && <button onClick={onIncrement}>increment counter</button>}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
