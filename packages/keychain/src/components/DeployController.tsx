import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { NavigationHeader } from "@/components";
import { useConnection } from "@/hooks/connection";
import { useDeploy } from "@/hooks/deploy";
import { useFeeToken } from "@/hooks/tokens";
import { ControllerError } from "@/utils/connection";
import {
  Button,
  CheckIcon,
  ControllerIcon,
  ExternalIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  Spinner,
} from "@cartridge/ui";
import { getChainName } from "@cartridge/ui/utils";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  constants,
  EstimateFee,
  FeeEstimate,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { ControllerErrorAlert, ErrorAlert } from "./ErrorAlert";
import { Fees } from "./Fees";
import { Funding } from "./funding";

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
  // Update: this is still cancer
  const feeEstimate: FeeEstimate | undefined = ctrlError?.data?.fee_estimate;
  const estimateFee: EstimateFee | undefined = feeEstimate
    ? {
        l2_gas_consumed: BigInt(feeEstimate.l2_gas_consumed ?? 0),
        l2_gas_price: BigInt(feeEstimate.l2_gas_price ?? 0),
        overall_fee: BigInt(feeEstimate.overall_fee),
        unit: feeEstimate.unit,
        suggestedMaxFee: BigInt(feeEstimate.overall_fee),
        l1_data_gas_consumed: BigInt(feeEstimate.l1_data_gas_consumed ?? 0),
        l1_data_gas_price: BigInt(feeEstimate.l1_data_gas_price ?? 0),
        l1_gas_consumed: BigInt(feeEstimate.l1_gas_consumed ?? 0),
        l1_gas_price: BigInt(feeEstimate.l1_gas_price ?? 0),
        resourceBounds: {
          l1_gas: {
            max_amount:
              typeof feeEstimate.overall_fee === "string"
                ? feeEstimate.overall_fee
                : feeEstimate.overall_fee.toString(),
            max_price_per_unit: feeEstimate.l1_gas_price?.toString() ?? "",
          },
          l2_gas: {
            max_amount:
              typeof feeEstimate.overall_fee === "string"
                ? feeEstimate.overall_fee
                : feeEstimate.overall_fee.toString(),
            max_price_per_unit: feeEstimate.l2_gas_price?.toString() ?? "",
          },
        },
      }
    : undefined;

  useEffect(() => {
    if (
      !controller ||
      controller.chainId() === constants.StarknetChainId.SN_MAIN ||
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
        <NavigationHeader
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
          title={"Fund Controller"}
          onComplete={() => {
            setAccountState("deploy");
          }}
        />
      );
    case "deploy":
      return (
        <LayoutContainer>
          <NavigationHeader
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
          <NavigationHeader
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
          <NavigationHeader
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
