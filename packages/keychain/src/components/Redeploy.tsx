import { constants, addAddressPadding } from "starknet";
import { Container } from "./Container";
import Controller from "utils/controller";
import { useEffect } from "react";
import { client } from "utils/graphql";
import { DeployAccountDocument, AccountInfoDocument } from "generated/graphql";
import { Status } from "utils/account";
import { SparklesDuoIcon } from "@cartridge/ui";
import { PortalBanner } from "./PortalBanner";

export function Redeploy({
  chainId,
  controller,
  onLogout,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onLogout: () => void;
}) {
  useEffect(() => {
    const deploy = async () => {
      const result = await client.request(AccountInfoDocument, {
        address: addAddressPadding(controller.address),
      });

      controller.account(constants.StarknetChainId.SN_SEPOLIA).status =
        Status.DEPLOYING;

      await client.request(DeployAccountDocument, {
        // @ts-expect-error TODO: fix type error
        id: result.accounts.edges?.[0]?.node.id,
        chainId: "starknet:SN_SEPOLIA",
      });

      console.log("sync redeploy");
      controller.account(constants.StarknetChainId.SN_SEPOLIA).sync();
    };

    deploy();
  }, [controller]);

  return (
    <Container chainId={chainId} onLogout={onLogout}>
      <PortalBanner
        Icon={SparklesDuoIcon}
        title="Deploying your account"
        description="This may take a second, try again in a bit"
      />
    </Container>
  );
}
