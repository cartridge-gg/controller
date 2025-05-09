import { PropsWithChildren } from "react";
import { UIProvider as Provider } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { useAccount } from "@/hooks/account";

export function UIProvider({ children }: PropsWithChildren) {
  const { controller, closeModal, openSettings } = useConnection();
  const account = useAccount();

  return (
    <Provider
      value={{
        account:
          account && controller
            ? {
                username: account.username,
                address: controller.address(),
              }
            : undefined,
        chainId: controller?.chainId(),
        closeModal,
        openSettings,
      }}
    >
      {children}
    </Provider>
  );
}
