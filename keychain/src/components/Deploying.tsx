import { useState } from "react";
import { Error as ErrorReply, ResponseCodes } from "@cartridge/controller";
import { constants, addAddressPadding } from "starknet";
import Container from "components/Container";
import { Header } from "components/Header";
import { Banner } from "components/Banner";
import SparkleColored from "@cartridge/ui/src/components/icons/SparkleColored";
import Controller from "utils/controller";
import { useEffect } from "react";
import { client } from "utils/graphql";
import { DeployAccountDocument } from "generated/graphql";
import {
  useAccountInfoQuery,
  useStarterPackQuery,
  useClaimStarterpackMutation,
} from "generated/graphql";

export const Deploying = ({
  chainId,
  controller,
  onClose,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onClose: (error: ErrorReply) => void;
}) => {
  const { refetch } = useAccountInfoQuery(
    {
      address: addAddressPadding(controller.address),
    },
    { enabled: false, retry: false },
  );

  useEffect(() => {
    const checkContract = async () => {
      const account = controller.account(chainId);
      const data = await account.getContract();

      if (!data?.contract?.deployTransaction?.id) {
        throw "no deploy txn";
      }

      const deployTxnHash = data.contract.deployTransaction.id.split("/")[1];
      const deployTxnReceipt = await account.getTransactionReceipt(
        deployTxnHash,
      );

      if (deployTxnReceipt.status === "REJECTED") {
        throw `txn rejected ${deployTxnHash}`;
      }
    };

    checkContract().catch(async (e) => {
      console.log(e);
      const result = await refetch();
      client
        .request(DeployAccountDocument, {
          id: result.data.accounts.edges?.[0]?.node.id,
          chainId: "starknet:SN_GOERLI",
        })
        .then(() => {
          controller.account(constants.StarknetChainId.TESTNET).sync();
        });
    });
  }, []);

  return (
    <Container>
      <Header
        onClose={() =>
          onClose({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          })
        }
      />
      <Banner
        icon={<SparkleColored boxSize="30px" />}
        title="Deploying your account"
        description="This may take a second, try again in a bit"
      />
    </Container>
  );
};
