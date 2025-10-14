import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { useConnection } from "@/hooks/connection";
import { useDeploy } from "@/hooks/deploy";
import { useFeeToken } from "@/hooks/tokens";
import { ControllerError } from "@/utils/connection";
import {
  Button,
  CheckIcon,
  ControllerIcon,
  ExternalIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Spinner,
} from "@cartridge/ui";
import { getChainName } from "@cartridge/ui/utils";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useExplorer } from "@starknet-react/core";
import {
  constants,
  FeeEstimate,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { ControllerErrorAlert, ErrorAlert } from "./ErrorAlert";
import { Fees } from "./Fees";
import { Funding } from "./funding";
import { parseDeployParams } from "@/utils/connection/deploy";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { ResponseCodes } from "@cartridge/controller";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function DeployController() {
  const params = useRouteParams(parseDeployParams);
  const handleCompletion = useRouteCompletion();
  const { cancelWithoutClosing } = useRouteCallbacks(params, CANCEL_RESPONSE);

  const handleCancel = useCallback(() => {
    cancelWithoutClosing();
    handleCompletion();
  }, [cancelWithoutClosing, handleCompletion]);

  if (!params) {
    return null;
  }

  return (
    <DeployControllerView
      onCancel={handleCancel}
      onComplete={(hash: string) => {
        params.resolve?.({ hash });
        cleanupCallbacks(params.params.id);
        handleCompletion();
      }}
    />
  );
}

export function DeployControllerView({
  onCancel,
  onComplete,
  ctrlError,
}: {
  onCancel: () => void;
  onComplete: (hash: string) => void;
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
  const feeEstimate: FeeEstimate | undefined = ctrlError?.data?.fee_estimate;

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
        .then(() => {
          setAccountState("deployed");
          onComplete(deployHash);
        })
        .catch((e) => setError(e));
    }
  }, [deployHash, controller, onComplete]);

  useEffect(() => {
    if (!feeEstimate || accountState != "fund" || !feeToken?.balance) return;

    if (feeToken.balance >= BigInt(feeEstimate.overall_fee)) {
      setAccountState("deploy");
    } else {
      setAccountState("fund");
    }
  }, [feeToken?.balance, feeEstimate, accountState]);

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
      <HeaderInner
        variant="expanded"
        title="Checking account balance..."
        icon={<Spinner size="xl" />}
        hideIcon
      />
    );
  }

  switch (accountState) {
    case "fund":
      return <Funding title={"Fund Controller"} />;
    case "deploy":
      return (
        <>
          <HeaderInner
            variant="expanded"
            icon={<ControllerIcon size="lg" />}
            title="Deploy Controller"
            description="This will deploy your Controller"
            hideIcon
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
              <Fees isLoading={false} maxFee={feeEstimate} />
            )}
            <Button onClick={onDeploy} isLoading={isDeploying}>
              DEPLOY
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </LayoutFooter>
        </>
      );
    case "deploying":
      return (
        <>
          <HeaderInner
            variant="expanded"
            icon={<Spinner size="xl" />}
            title="Deploying Controller"
            description={`Your controller is being deployed on ${chainName}`}
            hideIcon
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
        </>
      );
    case "deployed":
      return (
        <>
          <HeaderInner
            variant="expanded"
            Icon={CheckIcon}
            title="Success!"
            description={`Your controller has been deployed on ${chainName}`}
            hideIcon
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
            <Button onClick={onCancel}>continue</Button>
          </LayoutFooter>
        </>
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
  const explorer = useExplorer();

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
      to={explorer.transaction(txHash)}
      target="_blank"
      className="flex items-center gap-1 text-sm text-foreground-400 underline"
    >
      View Transaction
      <ExternalIcon size="sm" />
    </Link>
  );
}
