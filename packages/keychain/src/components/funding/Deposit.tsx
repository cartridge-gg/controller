import { PropsWithChildren, useCallback, useState } from "react";
import { mainnet, sepolia } from "@starknet-start/chains";
import { cartridge } from "@starknet-start/explorers";
import {
  StarknetConfig,
  useAccount,
  useConnect,
  useProvider,
  useSendTransaction,
  useSwitchChain,
  type UseConnectResult,
} from "@starknet-start/react";
import {
  CallData,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  addAddressPadding,
  cairo,
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
} from "@cartridge/controller-ui";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "../ErrorAlert";
import { AmountSelection } from "./AmountSelection";
import { Balance, BalanceType } from "./Balance";
import { convertUSDToTokenAmount, useFeeToken } from "@/hooks/tokens";
import { useToast } from "@/context/toast";

type DepositProps = {
  onComplete?: (deployHash?: string) => void;
};

type ExternalConnector = UseConnectResult["connectors"][number];

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
  const { address: extAddress } = useAccount();
  const { provider } = useProvider();
  const { sendAsync } = useSendTransaction({});
  const { switchChainAsync } = useSwitchChain({});
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
    (c: ExternalConnector) => {
      if (!controller) return;

      connectAsync({ connector: c })
        .then(async () => {
          await switchChainAsync({ chainId: controller.chainId() });

          setState("fund");
        })
        .catch(() => {
          /* user abort */
        });
    },
    [connectAsync, controller, switchChainAsync],
  );

  const onFund = useCallback(async () => {
    if (!extAddress) {
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
      const res = await sendAsync(calls);
      await provider.waitForTransaction(res.transaction_hash, {
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
  }, [
    feeToken,
    extAddress,
    controller,
    tokenAmount,
    onComplete,
    provider,
    sendAsync,
  ]);

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
        <div className="text-xs font-semibold text-foreground-400 tracking-wide select-none">
          Amount
        </div>
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
                      .filter((c) =>
                        ["argent", "braavos"].some((name) =>
                          c.name.toLowerCase().includes(name),
                        ),
                      )
                      .map((c) => (
                        <Button
                          key={c.name}
                          onClick={() => onConnect(c)}
                          className="flex-1"
                        >
                          {(() => {
                            const name = c.name.toLowerCase();
                            if (name.includes("argent")) {
                              return <ArgentIcon size="sm" />;
                            }
                            if (name.includes("braavos")) {
                              return <BraavosIcon size="sm" />;
                            }
                            return null;
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
  const { controller } = useConnection();

  if (!controller) {
    return children;
  }

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={() => controller.provider}
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
