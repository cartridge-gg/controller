import { addAddressPadding } from "starknet";
import { Container, Banner } from "components/layout";
import Controller from "utils/controller";
import { useEffect } from "react";
import { client } from "utils/graphql";
import { DeployAccountDocument, AccountInfoDocument } from "generated/graphql";
import { Status } from "utils/account";
import { SparklesDuoIcon } from "@cartridge/ui";
import { useChainId } from "hooks/connection";

export function Redeploy({
  controller,
  onLogout,
}: {
  controller: Controller;
  onLogout: () => void;
}) {
  const chainId = useChainId();

  useEffect(() => {
    const deploy = async () => {
      const result = await client.request(AccountInfoDocument, {
        address: addAddressPadding(controller.address),
      });

      controller.account.status = Status.DEPLOYING;

      await client.request(DeployAccountDocument, {
        // @ts-expect-error TODO: fix type error
        id: result.accounts.edges?.[0]?.node.id,
        chainId,
      });

      console.log("sync redeploy");
      controller.account.sync();
    };

    deploy();
  }, [chainId, controller]);

  return (
    <Container onLogout={onLogout}>
      <Banner
        Icon={SparklesDuoIcon}
        title="Deploying your account"
        description="This may take a second, try again in a bit"
      />
    </Container>
  );
}
