import { PropsWithChildren } from "react";
import { UIProvider as Provider } from "@cartridge/ui-next";
import { useConnection } from "#hooks/context";
import { useAccount } from "#hooks/account";

export function UIProvider({ children }: PropsWithChildren) {
  const { chainId, closeModal, openSettings } = useConnection();
  const account = useAccount();

  return (
    <Provider
      value={{
        account: account
          ? {
              username: account.username,
              address: account.address,
            }
          : undefined,
        chainId,
        closeModal,
        openSettings,
      }}
    >
      {children}
    </Provider>
  );
}
