import {
  constants,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useEffect, useState } from "react";
import { Button, Link } from "@chakra-ui/react";
import { CartridgeIcon, ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { Funding } from "./Funding";
import { useConnection } from "hooks/connection";
import { ErrorAlert } from "./ErrorAlert";

export function DeploymentRequired({ onClose }: { onClose: () => void }) {
  const {
    controller: { account },
  } = useController();
  const { hasPrefundRequest } = useConnection();
  const [deployHash, setDeployHash] = useState<string>();
  const [showFunding, setShowFunding] = useState(true);
  const [isDeployed, setIsDeployed] = useState(false);
  const [error, setError] = useState<Error>();
  useEffect(() => {
    if (
      account.chainId === constants.StarknetChainId.SN_MAIN ||
      hasPrefundRequest
    ) {
      setShowFunding(true);
      return;
    }
  }, [account.chainId, account.username, hasPrefundRequest]);

  useEffect(() => {
    if (deployHash) {
      account
        .waitForTransaction(deployHash, {
          retryInterval: 1000,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        })
        .then(() => setIsDeployed(true))
        .catch((e) => setError(e));
    }
  }, [deployHash, account]);

  if (showFunding)
    return (
      <Funding
        title={
          <>
            Fund <b style={{ color: "brand.primary" }}>{account.username}</b>{" "}
            for deployment
          </>
        }
        onComplete={(hash) => {
          if (hash) setDeployHash(hash);
          setShowFunding(false);
        }}
      />
    );

  return (
    <Container
      variant="connect"
      icon={
        isDeployed ? (
          <CartridgeIcon color="brand.primary" fontSize="5xl" />
        ) : (
          <PacmanIcon color="brand.primary" fontSize="3xl" />
        )
      }
      title={isDeployed ? "Controller ready!" : "Deploying your controller"}
      description={
        isDeployed ? "You can now close this window" : "This may take a second"
      }
    >
      <Content alignItems="center">
        {deployHash &&
          [
            constants.StarknetChainId.SN_SEPOLIA,
            constants.StarknetChainId.SN_MAIN,
          ].includes(account.chainId as constants.StarknetChainId) && (
            <Link
              href={`https://${
                account.chainId === constants.StarknetChainId.SN_SEPOLIA
                  ? "sepolia."
                  : ""
              }starkscan.co/tx/${deployHash}`}
              isExternal
            >
              <Button variant="link" mt={10} rightIcon={<ExternalIcon />}>
                View on Starkscan
              </Button>
            </Link>
          )}
      </Content>
      <Footer>
        {error && (
          <ErrorAlert
            title="Something went wrong"
            description={error.message}
          />
        )}
        <Button onClick={onClose}>Close</Button>
      </Footer>
    </Container>
  );
}
