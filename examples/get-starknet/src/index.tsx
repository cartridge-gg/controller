import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { getStarknet } from "get-starknet"
import { injectController } from '@cartridge/controller';
import { AccountInterface } from "starknet";

injectController(undefined, {
  starterPackId: "briq",
  chainId: "0x534e5f4d41494e" as any,
});

const Main = () => {
  const sn = useMemo(getStarknet, []);
  const [account, setAccount] = useState<AccountInterface>()

  useEffect(() => {
    sn.isPreauthorized().then(authorized => {
      if (authorized) {
        sn.enable().then(() => {
          setAccount(sn.account)
        })
      }
    })
  }, [])

  const onIncrement = useCallback(() => {
    account.execute([{
      contractAddress: "0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1",
      entrypoint: "incrementCounter",
      calldata: ['0x1']
    }])
  }, [account])

  return (
    <div>
      {!account && <button onClick={() => {
        sn.enable({ showModal: true })
      }}>connect</button>}
      {account && <button onClick={onIncrement}>increment counter</button>}
    </div>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
