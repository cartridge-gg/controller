import { useConnection } from "@/hooks/connection";
import { useControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useMemo } from "react";
import { QueryObserverResult } from "react-query";
import { constants } from "starknet";
import { AddSigner } from "./signers/add-signer/add-signer";

export function AddSignerRoute() {
  const { controller, chainId } = useConnection();

  const controllerQueryRaw = useControllerQuery(
    {
      username: controller?.username() ?? "",
      chainId: constants.NetworkName.SN_MAIN,
    },
    {
      refetchOnMount: "always",
    },
  );

  const controllerQuery = useMemo(() => {
    if (chainId === constants.StarknetChainId.SN_MAIN) {
      return controllerQueryRaw;
    }
    return {
      ...controllerQueryRaw,
      data: {
        controller: {
          ...controllerQueryRaw.data?.controller,
          signers: controllerQueryRaw.data?.controller?.signers
            ? [controllerQueryRaw.data?.controller?.signers[0]]
            : undefined,
        },
        ...controllerQueryRaw.data,
      },
    } as QueryObserverResult<any>;
  }, [chainId, controllerQueryRaw.data]);

  return <AddSigner controllerQuery={controllerQuery} />;
}
