import {
  constants,
  EstimateFee,
  FeeEstimate,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutContainer,
  LayoutFooter,
  LayoutContent,
  CheckIcon,
  ExternalIcon,
  Spinner,
  Button,
  LayoutHeader,
  ControllerIcon,
} from "@cartridge/ui-next";
import { Funding } from "./funding";
import { useConnection } from "@/hooks/connection";
import { ControllerErrorAlert, ErrorAlert } from "./ErrorAlert";
import { useDeploy } from "@/hooks/deploy";
import { Fees } from "./Fees";
import { ControllerError } from "@/utils/connection";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { Link } from "react-router-dom";
import { useFeeToken } from "@/hooks/tokens";
import { getChainName } from "@cartridge/utils";

export function DeployController({
  onClose,
  ctrlError,
}: {
  onClose: () => void;
  ctrlError?: ControllerError;
}) {
  const { controller } = useConnection();
  const { deploySelf, isDeploying } = useDeploy();
  const { token: feeToken, isLoading } = useFeeToken();
  const [deployHash, setDeployHash] = useState<string>();
  const [error, setError] = useState<Error>();
  const [accountState, setAccountState] = useState<
    "fund" | "deploy" | "deploying" | "deployed"
  >("fund");

  const chainId = controller?.chainId();
  const chainName = chainId ? getChainName(chainId) : "Unknown";

  // What is this cancer
  const feeEstimate: FeeEstimate | undefined = ctrlError?.data?.fee_estimate;
  const estimateFee: EstimateFee | undefined = feeEstimate
    ? {
        gas_consumed: BigInt(feeEstimate.gas_consumed),
        overall_fee: BigInt(feeEstimate.overall_fee),
        gas_price: BigInt(feeEstimate.gas_price),
        unit: feeEstimate.unit,
        suggestedMaxFee: BigInt(feeEstimate.overall_fee),
        data_gas_consumed: BigInt(
          feeEstimate.data_gas_consumed ? feeEstimate.data_gas_consumed : "0x0",
        ),
        data_gas_price: BigInt(
          feeEstimate.data_gas_price ? feeEstimate.data_gas_price : "0x0",
        ),
        resourceBounds: {
          l1_gas: {
            max_amount: feeEstimate.overall_fee,
            max_price_per_unit: feeEstimate.gas_price,
          },
          l2_gas: {
            max_amount: feeEstimate.overall_fee,
            max_price_per_unit: feeEstimate.gas_price,
          },
        },
      }
    : undefined;

  useEffect(() => {
    if (
      !controller ||
      controller.chainId() !== constants.StarknetChainId.SN_MAIN ||
      !feeEstimate
    ) {
      return;
    }

    setAccountState("deploy");
  }, [controller, feeEstimate]);

  useEffect(() => {
    if (deployHash && controller) {
      controller.provider
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

  useEffect(() => {
    if (!estimateFee || accountState != "fund" || !feeToken?.balance) return;

    if (feeToken.balance >= estimateFee.overall_fee) {
      setAccountState("deploy");
    } else {
      setAccountState("fund");
    }
  }, [feeToken?.balance, estimateFee, accountState]);

  const onDeploy = useCallback(async () => {
    if (!estimateFee) return;

    try {
      const hash = await deploySelf(estimateFee);
      setDeployHash(hash);
    } catch (e) {
      if (e instanceof Error && e.message.includes("DuplicateTx")) {
        return;
      }
      setError(e as Error);
    }
  }, [deploySelf, estimateFee]);

  if (isLoading) {
    return (
      <LayoutContainer>
        <LayoutHeader
          variant="expanded"
          title="Checking account balance..."
          icon={<Spinner size="xl" />}
        />
      </LayoutContainer>
    );
  }

  switch (accountState) {
    case "fund":
      return (
        <Funding
          title={
            <>
              Fund <b className="text-primary">{controller?.username()}</b> for
              deployment
            </>
          }
          onComplete={() => {
            setAccountState("deploy");
          }}
        />
      );
    case "deploy":
      return (
        <LayoutContainer>
          <LayoutHeader
            variant="expanded"
            icon={<ControllerIcon size="lg" />}
            title="Deploy Controller"
            description="This will deploy your Controller"
          />
          <LayoutContent>
            <TransactionSummary
              calls={[
                {
                  entrypoint: "deploy",
                  contractAddress:
                    "0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
                },
              ]}
            />
          </LayoutContent>

          <LayoutFooter>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : (
              <Fees isLoading={false} maxFee={estimateFee} />
            )}
            <Button onClick={onDeploy} isLoading={isDeploying}>
              DEPLOY
            </Button>
          </LayoutFooter>
        </LayoutContainer>
      );
    case "deploying":
      return (
        <LayoutContainer>
          <LayoutHeader
            variant="expanded"
            icon={<Spinner size="xl" />}
            title="Deploying Controller"
            description={`Your controller is being deployed on ${chainName}`}
          />
          <LayoutContent>
            {deployHash && controller && (
              <ExplorerLink
                chainId={controller.chainId()}
                txHash={deployHash}
              />
            )}
          </LayoutContent>
          <LayoutFooter>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : !deployHash && ctrlError ? (
              <ControllerErrorAlert error={ctrlError} />
            ) : null}
            <Button onClick={onDeploy} isLoading={isDeploying}>
              continue
            </Button>
          </LayoutFooter>
        </LayoutContainer>
      );
    case "deployed":
      return (
        <LayoutContainer>
          <LayoutHeader
            variant="expanded"
            Icon={CheckIcon}
            title="Success!"
            description={`Your controller has been deployed on ${chainName}`}
          />
          <LayoutContent className="items-center">
            {deployHash && controller && (
              <ExplorerLink
                chainId={controller.chainId()}
                txHash={deployHash}
              />
            )}
          </LayoutContent>
          <LayoutFooter>
            {error ? (
              <ErrorAlert
                title="Something went wrong"
                description={error.message}
              />
            ) : !deployHash && ctrlError ? (
              <ControllerErrorAlert error={ctrlError} />
            ) : null}
            <Button onClick={onClose}>continue</Button>
          </LayoutFooter>
        </LayoutContainer>
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
      to={`https://${
        chainId === constants.StarknetChainId.SN_SEPOLIA ? "sepolia." : ""
      }starkscan.co/tx/${txHash}`}
      target="_blank"
      className="flex items-center gap-1 text-sm text-foreground-400 underline"
    >
      View on Starkscan
      <ExternalIcon size="sm" />
    </Link>
  );
}
