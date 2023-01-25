import { constants } from "starknet";
import Controller from "utils/controller";
import { Error as ErrorReply, ResponseCodes } from "@cartridge/controller";
import Container from "components/Container";
import { Header } from "components/Header";
import { Banner } from "components/Banner";
import SparkleColored from "@cartridge/ui/components/icons/SparkleColored";
import { useEffect, useState } from "react";
import { Status } from "utils/account";

const DeploymentRequired = ({
  chainId,
  controller,
  onClose,
  children,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onClose: (error: ErrorReply) => void;
  children: React.ReactNode;
}) => {
  const close = () => {
    onClose({
      code: ResponseCodes.CANCELED,
      message: "Canceled",
    });
  };

  const account = controller.account(chainId);
  const [status, setStatus] = useState<Status>(account.status);

  useEffect(() => {
    const id = setInterval(async () => {
      if (account.status !== Status.DEPLOYING) clearInterval(id);
      setStatus(account.status);
      await account.sync();
    }, 2000);

    return () => clearInterval(id);
  }, [account, setStatus]);

  return status === Status.DEPLOYING ? (
    <Container>
      <Header onClose={close} />
      <Banner
        icon={<SparkleColored boxSize="30px" />}
        title="Deploying your account"
        description="This may take a second"
      />
    </Container>
  ) : (
    <>{children}</>
  );
};

export default DeploymentRequired;
