import {
  constants,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Container, Footer, Content } from "components/layout";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon, ExternalIcon, FnIcon, WandIcon } from "@cartridge/ui";
import { Funding } from "./Funding";
import { useConnection } from "hooks/connection";
import { ControllerErrorAlert, ErrorAlert } from "./ErrorAlert";
import { ETH_MIN_PREFUND } from "utils/token";
import { useDeploy } from "hooks/deploy";
import { Fees } from "./Fees";
import { ControllerError } from "utils/connection";
import { useBalance } from "hooks/token";

export function DeployController({
  onClose,
  ctrlError,
}: {
  onClose: () => void;
  ctrlError?: ControllerError;
}) {
  const {
    controller: { account },
    chainName,
    hasPrefundRequest,
  } = useConnection();
  const { deploySelf, isDeploying } = useDeploy();
  const [fundHash, setFundHash] = useState<string>();
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [accountState, setAccountState] = useState<
    "fund" | "funding" | "deploy" | "deploying" | "deployed"
  >("fund");
  const feeEstimate: string | undefined =
    ctrlError.data?.fee_estimate.overall_fee;

  useEffect(() => {
    if (
      account.chainId !== constants.StarknetChainId.SN_MAIN ||
      !hasPrefundRequest ||
      !feeEstimate
    ) {
      return;
    }

    setAccountState("deploy");
  }, [account.chainId, account.username, hasPrefundRequest, feeEstimate]);

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

  const { balance } = useBalance({ address: account.address });
  useEffect(() => {
    if (!feeEstimate || !["fund", "funding"].includes(accountState)) return;

    if (balance >= BigInt(feeEstimate)) {
      setAccountState("deploy");
    }
  }, [balance, feeEstimate, accountState]);

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

  switch (accountState) {
    case "fund":
      return (
        <Funding
          title={
            <>
              Fund <b style={{ color: "brand.primary" }}>{account.username}</b>{" "}
              for deployment
            </>
          }
          defaultAmount={feeEstimate ?? ETH_MIN_PREFUND}
          onComplete={(hash) => {
            setFundHash(hash);
            setAccountState("funding");
          }}
        />
      );
    case "funding":
      return (
        <Container
          variant="connect"
          icon={<Spinner />}
          title="Funding Controller"
          description={`Your controller is being funded on ${chainName}`}
        >
          <Content alignItems="center">
            {fundHash && (
              <ExplorerLink chainId={account.chainId} txHash={fundHash} />
            )}
          </Content>
        </Container>
      );
    case "deploy":
      return (
        <Container
          variant="connect"
          icon={<WandIcon fontSize="5xl" variant="line" />}
          title="Deploy Controller"
          description="This will initialize your controller on the new network"
        >
          <Content>
            <VStack borderRadius="sm" bg="solid.bg" gap={1}>
              <Box bg="solid.primary" w="full" p={3}>
                <Text
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  transaction data
                </Text>
              </Box>
              <HStack bg="solid.primary" w="full" p={3}>
                <FnIcon boxSize={5} color="text.secondary" />
                <Text fontSize="sm">deploy</Text>
              </HStack>
            </VStack>
          </Content>

          <Footer>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : (
              <Fees maxFee={BigInt(feeEstimate)} />
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
          variant="connect"
          icon={<Spinner />}
          title="Deploying Controller"
          description={`Your controller is being deployed on ${chainName}`}
        >
          <Content alignItems="center">
            {deployHash && (
              <ExplorerLink chainId={account.chainId} txHash={deployHash} />
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
          variant="connect"
          icon={<CheckIcon fontSize="5xl" />}
          title="Success!"
          description={`Your controller has been deployed on ${chainName}`}
        >
          <Content alignItems="center">
            {deployHash && (
              <ExplorerLink chainId={account.chainId} txHash={deployHash} />
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
