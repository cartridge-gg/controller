import { useConnection } from "@/hooks/connection";
import { processControllerQuery } from "@/utils/signers";
import { useControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { constants } from "starknet";
import { AddSigner } from "./signers/add-signer/add-signer";

export function AddSignerRoute() {
  const { controller, chainId } = useConnection();

  const controllerQuery = useControllerQuery(
    {
      username: controller?.username() ?? "",
      chainId: constants.NetworkName.SN_MAIN,
    },
    {
      refetchOnMount: "always",
      select: (data) => processControllerQuery(data, chainId ?? ""),
      enabled: !!chainId,
      queryKey: ["controller", controller?.username(), chainId],
    },
  );

  return <AddSigner controllerQuery={controllerQuery} />;
}
