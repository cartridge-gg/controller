import { constants } from "starknet";
import Controller from "utils/controller";
import { Container } from "./Container";
import { useEffect, useState } from "react";
import { Status } from "utils/account";
import { Loading } from "./Loading";
import { Button, Link } from "@chakra-ui/react";
import { NamedChainId } from "@cartridge/controller/src/constants";
import { ExternalIcon } from "@cartridge/ui";
import { PortalBanner } from "./PortalBanner";
import { PortalFooter } from "./PortalFooter";

export function DeploymentRequired({
  chainId,
  controller,
  onClose,
  onLogout,
  children,
}: {
  chainId: constants.StarknetChainId;
  controller: Controller;
  onClose: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
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
      console.log("deployment required signup");
      await account.sync();
    }, 2000);

    return () => clearInterval(id);
  }, [account, setStatus]);

  if (status === Status.DEPLOYING) {
    return (
      <Container
        fullPage={false}
        chainId={chainId}
        address={account.address}
        onLogout={onLogout}
      >
        <PortalBanner
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
            <Button variant="link" marginTop={10} rightIcon={<ExternalIcon />}>
              View on Starkscan
            </Button>
          </Link>
        )}

        <PortalFooter>
          <Button onClick={onClose}>close</Button>
        </PortalFooter>
      </Container>
    );
  }

  return <>{children}</>;
}
