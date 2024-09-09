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
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [accountState, setAccountState] = useState<
    "fund" | "deploy" | "deployed"
  >("fund");

  useEffect(() => {
    if (
      account.chainId === constants.StarknetChainId.SN_MAIN ||
      hasPrefundRequest
    ) {
      setAccountState("fund");
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
        .then(() => setAccountState("deployed"))
        .catch((e) => setError(e));
    }
  }, [deployHash, account]);
  const details = ctrlError?.details ? JSON.parse(ctrlError?.details) : null;
  const feeEstimate: string = details?.fee_estimate.overall_fee;

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

  if (accountState === "fund") {
    return (
      <Funding
        title={
          <>
            Fund <b style={{ color: "brand.primary" }}>{account.username}</b>{" "}
            for deployment
          </>
        }
        onComplete={() => {
          setAccountState("deploy");
        }}
        defaultAmount={feeEstimate ?? ETH_MIN_PREFUND}
      />
    );
  }

  return (
    <Container
      variant="connect"
      icon={
        accountState === "deployed" ? (
          <CartridgeIcon color="brand.primary" fontSize="5xl" />
        ) : (
          <PacmanIcon color="brand.primary" fontSize="3xl" />
        )
      }
      title={
        accountState === "deployed"
          ? "Controller ready!"
          : "Deploying your controller"
      }
      description={
        accountState === "deployed"
          ? "You can now close this window"
          : "This may take a second"
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
        <Button
          colorScheme="colorful"
          onClick={onDeploy}
          isLoading={isDeploying}
        >
          DEPLOY ACCOUNT
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Footer>
    </Container>
  );
}
