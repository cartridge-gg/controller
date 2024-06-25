import { Container } from "components/layout";
import Controller from "utils/controller";
import { useEffect } from "react";
import { client } from "utils/graphql";
import { DeployAccountDocument } from "generated/graphql";
import { Status } from "utils/account";
import { SparklesDuoIcon } from "@cartridge/ui";
import { useChainId } from "hooks/connection";

export function Redeploy({ controller }: { controller: Controller }) {
  const chainId = useChainId();

  useEffect(() => {
    const deploy = async () => {
      controller.account.status = Status.DEPLOYING;

      await client.request(DeployAccountDocument, {
        id: controller.username,
        chainId,
      });

      console.log("sync redeploy");
      controller.account.sync();
    };

    deploy();
  }, [chainId, controller]);

  return (
    <Container
      Icon={SparklesDuoIcon}
      title="Deploying your account"
      description="This may take a second, try again in a bit"
    />
  );
}
