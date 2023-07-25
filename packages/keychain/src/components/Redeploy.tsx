import { Error as ErrorReply, ResponseCodes } from "@cartridge/controller";
import { constants, addAddressPadding } from "starknet";
import Container from "components/Container";
import { Header } from "components/Header";
import { Banner } from "components/Banner";
import SparkleColored from "@cartridge/ui/src/components/icons/SparkleColored";
import Controller from "utils/controller";
import { useEffect } from "react";
import { client } from "utils/graphql";
import { DeployAccountDocument, AccountInfoDocument } from "generated/graphql";
import { Status } from "utils/account";

export const Redeploy = ({
  chainId,
  controller,
  onClose,
  onLogout,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onClose: (error: ErrorReply) => void;
  onLogout: () => void;
}) => {
  useEffect(() => {
    const deploy = async () => {
      const result = await client.request(AccountInfoDocument, {
        address: addAddressPadding(controller.address),
      });

      controller.account(constants.StarknetChainId.TESTNET).status =
        Status.DEPLOYING;

      await client.request(DeployAccountDocument, {
        id: result.accounts.edges?.[0]?.node.id,
        chainId: "starknet:SN_GOERLI",
      });

      console.log("sync redeploy")
      controller.account(constants.StarknetChainId.TESTNET).sync();
    };

    deploy();
  }, [controller]);

  return (
    <Container>
      <Header
        chainId={chainId}
        onClose={() =>
          onClose({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          })
        }
        onLogout={onLogout}
      />
      <Banner
        icon={<SparkleColored boxSize="30px" />}
        title="Deploying your account"
        description="This may take a second, try again in a bit"
      />
    </Container>
  );
};
