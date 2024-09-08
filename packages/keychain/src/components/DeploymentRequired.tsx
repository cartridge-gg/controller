import {
  constants,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import { Button, Link } from "@chakra-ui/react";
import { CartridgeIcon, ExternalIcon, PacmanIcon } from "@cartridge/ui";
import { useController } from "hooks/controller";
import { Funding } from "./Funding";
import { useConnection } from "hooks/connection";
import { ControllerErrorAlert, ErrorAlert } from "./ErrorAlert";
import { JsControllerError } from "@cartridge/account-wasm";
import { ETH_MIN_PREFUND } from "utils/token";
import { useDeploy } from "hooks/deploy";

export function DeploymentRequired({
  onClose,
  ctrlError,
}: {
  onClose: () => void;
  ctrlError?: JsControllerError;
}) {
  const {
    controller: { account },
  } = useController();
  const { hasPrefundRequest } = useConnection();
  const { deploySelf, isDeploying } = useDeploy();
  const [fundHash, setFundHash] = useState<string>();
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
  const details = ctrlError?.details ? JSON.parse(ctrlError?.details) : null;
  const feeEstimate: string = details?.fee_estimate;

  const onDeploy = useCallback(async () => {
    try {
      const hash = await deploySelf(feeEstimate);
      setDeployHash(hash);
    } catch (e) {
      if (e.message && e.message.includes("DuplicateTx")) {
        return;
      }

      setError(e);
    }
  }, [deploySelf, feeEstimate]);

  if (showFunding) {
    return (
      <Funding
        title={
          <>
            Fund <b style={{ color: "brand.primary" }}>{account.username}</b>{" "}
            for deployment
          </>
        }
        onComplete={(hash) => {
          if (hash) setFundHash(hash);
          setShowFunding(false);
        }}
        defaultAmount={feeEstimate ?? ETH_MIN_PREFUND}
      />
    );
  }

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
        {ctrlError && <ControllerErrorAlert error={ctrlError} />}
        <Button colorScheme="colorful" onClick={onDeploy}>
          DEPLOY ACCOUNT
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Footer>
    </Container>
  );
}
