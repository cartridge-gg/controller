import { constants } from "starknet";
import Controller from "utils/controller";
import { Error as ErrorReply, ResponseCodes } from "@cartridge/controller";
import Container from "components/Container";
import { Header } from "components/Header";
import { Banner } from "components/Banner";
import { useEffect, useState } from "react";
import { Status } from "utils/account";
import Footer from "./Footer";
import { Loading } from "./Loading";
import { Button, Link } from "@chakra-ui/react";
import LinkIcon from "@cartridge/ui/components/icons/Link";
import { NamedChainId } from "@cartridge/controller/src/constants";

const DeploymentRequired = ({
  chainId,
  controller,
  onClose,
  onLogout,
  children,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onClose: (error: ErrorReply) => void;
  onLogout: () => void;
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
  const [deployHash, setDeployHash] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      if (account.status !== Status.DEPLOYING) {
        return;
      }
      const data = await account.getContract();
      if (!data?.contract?.deployTransaction?.id) {
        return;
      }
      const deployTxnHash = data.contract.deployTransaction.id.split("/")[1];
      setDeployHash(deployTxnHash);
    };

    fetch();
  }, [account]);

  useEffect(() => {
    const id = setInterval(async () => {
      if (account.status !== Status.DEPLOYING) clearInterval(id);
      setStatus(account.status);
      console.log("deployment required signup")
      await account.sync();
    }, 2000);

    return () => clearInterval(id);
  }, [account, setStatus]);

  return status === Status.DEPLOYING ? (
    <Container>
      <Header
        chainId={chainId}
        address={account.address}
        onClose={() =>
          onClose({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          })
        }
        onLogout={onLogout}
      />
      <Banner
        icon={<Loading fill="white" />}
        title="Deploying your account"
        description="This may take a second"
      />
      {typeof deployHash === "string" && (
        <Link
          href={`https://${
            NamedChainId[account._chainId] === "SN_GOERLI"
              ? "testnet."
              : undefined
          }starkscan.co/tx/${deployHash}`}
          isExternal
        >
          <Button
            variant="legacyDark"
            size="xs"
            fontSize="11px"
            color="legacy.blue.400"
            marginTop="40px"
            rightIcon={<LinkIcon />}
          >
            View on Starkscan
          </Button>
        </Link>
      )}
      <Footer cancelText="Close" onCancel={close} showConfirm={false} />
    </Container>
  ) : (
    <>{children}</>
  );
};

export default DeploymentRequired;
