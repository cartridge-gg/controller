import { PropsWithChildren, useCallback, useState } from "react";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  Connector,
  StarknetConfig,
  useAccount,
  useConnect,
  useInjectedConnectors,
  cartridge,
} from "@starknet-react/core";
import {
  CallData,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  addAddressPadding,
  cairo,
  num,
  wallet,
} from "starknet";
import {
  LayoutContent,
  LayoutFooter,
  ArgentIcon,
  BraavosIcon,
  CopyIcon,
  DepositIcon,
  Button,
  CopyAddress,
  Separator,
  HeaderInner,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "../ErrorAlert";
import { AmountSelection } from "./AmountSelection";
import { Balance, BalanceType } from "../purchase/Balance";
import { convertUSDToTokenAmount, useFeeToken } from "@/hooks/tokens";
import { useToast } from "@/context/toast";

type DepositProps = {
  onComplete?: (deployHash?: string) => void;
};

export function Deposit(innerProps: DepositProps) {
  return (
    <ExternalWalletProvider>
      <DepositInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

function DepositInner({ onComplete }: DepositProps) {
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { controller } = useConnection();
  const { account: extAccount } = useAccount();
  const { token: feeToken } = useFeeToken();
  const { toast } = useToast();

  const [state, setState] = useState<"connect" | "fund">("connect");
  const [tokenAmount, setTokenAmount] = useState<bigint>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const onAmountChanged = useCallback(
    (usdAmount: number) => {
      if (!feeToken?.price) return;
      const tokenAmount = convertUSDToTokenAmount(
        usdAmount,
        feeToken?.decimals,
        feeToken?.price,
      );
      setTokenAmount(tokenAmount);
    },
    [feeToken?.price, feeToken?.decimals],
  );

  const onConnect = useCallback(
    (c: Connector) => {
      if (!controller) return;

      connectAsync({ connector: c })
        .then(async () => {
          const connectedChain = await c.chainId();
          if (num.toHex(connectedChain) !== controller.chainId()) {
            await wallet.switchStarknetChain(
              window.starknet,
              controller.chainId(),
            );
          }

          setState("fund");
        })
        .catch(() => {
          /* user abort */
        });
    },
    [connectAsync, controller],
  );

  const onFund = useCallback(async () => {
    if (!extAccount) {
      throw new Error("External account is not connected");
    }

    if (!feeToken || !tokenAmount || !controller) {
      return;
    }

    try {
      setIsLoading(true);
      const calls = [
        {
          contractAddress: feeToken.address,
          entrypoint: "approve",
          calldata: CallData.compile({
            recipient: controller.address(),
            amount: cairo.uint256(tokenAmount),
          }),
        },
        {
          contractAddress: feeToken.address,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: controller.address(),
            amount: cairo.uint256(tokenAmount),
          }),
        },
      ];
      const res = await extAccount.execute(calls);
      await extAccount.waitForTransaction(res.transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });

      onComplete?.(res.transaction_hash);
    } catch (e) {
      setError(e as unknown as Error);
    } finally {
      setIsLoading(false);
    }
  }, [feeToken, extAccount, controller, tokenAmount, onComplete]);

  const onCopy = useCallback(() => {
    if (!controller) return;

    navigator.clipboard.writeText(addAddressPadding(controller.address()));
    toast.success("Address copied");
  }, [controller, toast]);

  return (
    <>
      <HeaderInner
        title="Deposit"
        description={
          controller ? (
            <CopyAddress address={controller.address()} />
          ) : undefined
        }
        icon={<DepositIcon variant="solid" size="lg" />}
        hideIcon
      />

      <LayoutContent>
        <Balance types={[BalanceType.FEE_TOKEN]} />
      </LayoutContent>

      <LayoutFooter>
        <AmountSelection lockSelection={isLoading} onChange={onAmountChanged} />
        <Separator className="bg-spacer m-1" />
        {error && (
          <ErrorAlert
            title="Account deposit error"
            description={getHumanReadableError(error)}
          />
        )}

        {(() => {
          switch (state) {
            case "connect":
              if (isConnecting) {
                return <Button isLoading />;
              }

              return (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full flex gap-4">
                    {connectors
                      .filter((c) => ["argentX", "braavos"].includes(c.id))
                      .map((c) => (
                        <Button
                          key={c.id}
                          onClick={() => onConnect(c)}
                          className="flex-1"
                        >
                          {(() => {
                            switch (c.id) {
                              case "argentX":
                                return <ArgentIcon size="sm" />;
                              case "braavos":
                                return <BraavosIcon size="sm" />;
                              default:
                                return null;
                            }
                          })()}
                          {c.name}
                        </Button>
                      ))}
                  </div>

                  {connectors.length !== 0 && (
                    <div className="text-xs text-foreground-400 font-bold">
                      OR
                    </div>
                  )}
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={onCopy}
                  >
                    <CopyIcon size="sm" /> copy address
                  </Button>
                </div>
              );
            case "fund":
              return (
                <Button onClick={onFund} isLoading={isLoading}>
                  Send Funds
                </Button>
              );
          }
        })()}
      </LayoutFooter>
    </>
  );
}

function ExternalWalletProvider({ children }: PropsWithChildren) {
  const { connectors } = useInjectedConnectors({});
  const { controller } = useConnection();

  if (!controller) {
    return children;
  }

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={() => controller.provider}
      connectors={connectors}
      explorer={cartridge}
    >
      {children}
    </StarknetConfig>
  );
}

const getHumanReadableError = (error: Error): string => {
  const message = error.message;
  if (message.includes("USER_REFUSED_OP")) {
    return "Transaction approval refused in wallet";
  }
  return message;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    starknet: any;
  }
}
