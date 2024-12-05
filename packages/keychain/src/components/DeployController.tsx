import {
  constants,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import { Button, Link, Spinner } from "@chakra-ui/react";
import { CheckIcon, ExternalIcon, WandIcon } from "@cartridge/ui";
import { Funding } from "./Funding";
import { useConnection } from "hooks/connection";
import { ControllerErrorAlert, ErrorAlert } from "./ErrorAlert";
import { useDeploy } from "hooks/deploy";
import { Fees } from "./Fees";
import { ControllerError } from "utils/connection";
import { Policies } from "components/Policies";
import { ETH_CONTRACT_ADDRESS, useERC20Balance } from "@cartridge/utils";

export function DeployController({
  onClose,
  ctrlError,
}: {
  onClose: () => void;
  ctrlError?: ControllerError;
}) {
  const { controller, chainName, hasPrefundRequest } = useConnection();
  const { deploySelf, isDeploying } = useDeploy();
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [accountState, setAccountState] = useState<
    "fund" | "deploy" | "deploying" | "deployed"
  >("fund");
  const feeEstimate: string | undefined =
    ctrlError?.data?.fee_estimate.overall_fee;

  useEffect(() => {
    if (
      !controller ||
      controller.chainId() !== constants.StarknetChainId.SN_MAIN ||
      !hasPrefundRequest ||
      !feeEstimate
    ) {
      return;
    }

    setAccountState("deploy");
  }, [controller, hasPrefundRequest, feeEstimate]);

  useEffect(() => {
    if (deployHash && controller) {
      controller
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
  }, [deployHash, controller]);

  const {
    data: [eth],
    isLoading,
  } = useERC20Balance({
    address: controller?.address,
    contractAddress: ETH_CONTRACT_ADDRESS,
    provider: controller,
    interval: 3000,
    decimals: 2,
  });
  useEffect(() => {
    if (!feeEstimate || accountState != "fund" || !eth?.balance.value) return;

    if (eth.balance.value >= BigInt(feeEstimate)) {
      setAccountState("deploy");
    } else {
      setAccountState("fund");
    }
  }, [eth?.balance.value, feeEstimate, accountState]);

  const onDeploy = useCallback(async () => {
    if (!feeEstimate) return;

    try {
      const hash = await deploySelf(feeEstimate);
      setDeployHash(hash);
    } catch (e) {
      if (e instanceof Error && e.message.includes("DuplicateTx")) {
        return;
      }
      setError(e as Error);
    }
  }, [deploySelf, feeEstimate]);

  if (isLoading) {
    return (
      <Container
        variant="expanded"
        title="Checking account balance..."
        icon={<Spinner />}
      />
    );
  }

  switch (accountState) {
    case "fund":
      return (
        <Funding
          title={
            <>
              Fund{" "}
              <b style={{ color: "brand.primary" }}>{controller?.username()}</b>{" "}
              for deployment
            </>
          }
          onComplete={() => {
            setAccountState("deploy");
          }}
        />
      );
    case "deploy":
      return (
        <Container
          variant="expanded"
          icon={<WandIcon fontSize="5xl" variant="line" />}
          title="Deploy Controller"
          description="This will initialize your controller on the new network"
        >
          <Content>
            <Policies
              title="Transaction Details"
              policies={[
                {
                  target:
                    "0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
                  method: "deploy",
                },
              ]}
            />
          </Content>

          <Footer>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : (
              feeEstimate && <Fees maxFee={BigInt(feeEstimate)} />
            )}
            <Button
              colorScheme="colorful"
              onClick={onDeploy}
              isLoading={isDeploying}
            >
              DEPLOY
            </Button>
          </Footer>
        </Container>
      );
    case "deploying":
      return (
        <Container
          variant="expanded"
          icon={<Spinner />}
          title="Deploying Controller"
          description={`Your controller is being deployed on ${chainName}`}
        >
          <Content alignItems="center">
            {deployHash && controller && (
              <ExplorerLink
                chainId={controller.chainId()}
                txHash={deployHash}
              />
            )}
          </Content>
          <Footer>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : !deployHash && ctrlError ? (
              <ControllerErrorAlert error={ctrlError} />
            ) : null}
            <Button
              colorScheme="colorful"
              onClick={onDeploy}
              isLoading={isDeploying}
            >
              continue
            </Button>
          </Footer>
        </Container>
      );
    case "deployed":
      return (
        <Container
          variant="expanded"
          icon={<CheckIcon fontSize="5xl" />}
          title="Success!"
          description={`Your controller has been deployed on ${chainName}`}
        >
          <Content alignItems="center">
            {deployHash && controller && (
              <ExplorerLink
                chainId={controller.chainId()}
                txHash={deployHash}
              />
            )}
          </Content>
          <Footer>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : !deployHash && ctrlError ? (
              <ControllerErrorAlert error={ctrlError} />
            ) : null}
            <Button colorScheme="colorful" onClick={onClose}>
              continue
            </Button>
          </Footer>
        </Container>
      );
  }
}

function ExplorerLink({
  txHash,
  chainId,
}: {
  txHash: string;
  chainId: string;
}) {
  if (
    ![
      constants.StarknetChainId.SN_SEPOLIA,
      constants.StarknetChainId.SN_MAIN,
    ].includes(chainId as constants.StarknetChainId)
  ) {
    return null;
  }

  return (
    <Link
      href={`https://${
        chainId === constants.StarknetChainId.SN_SEPOLIA ? "sepolia." : ""
      }starkscan.co/tx/${txHash}`}
      isExternal
    >
      <Button
        variant="goast"
        mt={10}
        rightIcon={<ExternalIcon />}
        textTransform="none"
        fontWeight="normal"
        fontSize="sm"
        fontFamily="Inter"
      >
        View on Starkscan
      </Button>
    </Link>
  );
}
