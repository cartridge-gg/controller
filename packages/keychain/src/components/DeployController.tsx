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

export function DeployController({
  onClose,
  ctrlError,
}: {
  onClose: () => void;
  ctrlError: ControllerError;
}) {
  const {
    controller: { account },
    chainName,
    hasPrefundRequest,
  } = useConnection();
  const { deploySelf, isDeploying } = useDeploy();
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [accountState, setAccountState] = useState<
    "fund" | "deploy" | "deploying" | "deployed"
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
  
  const feeEstimate: string = ctrlError.data?.fee_estimate.overall_fee;

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
          onComplete={() => {
            setAccountState("deploy");
          }}
          defaultAmount={feeEstimate ?? ETH_MIN_PREFUND}
        />
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
              <ExplorerLink chainId={account.chainId} deployHash={deployHash} />
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
              <ExplorerLink chainId={account.chainId} deployHash={deployHash} />
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
  deployHash,
  chainId,
}: {
  deployHash: string;
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
      }starkscan.co/tx/${deployHash}`}
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
