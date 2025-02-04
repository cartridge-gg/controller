import { PropsWithChildren, useCallback, useState } from "react";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  Connector,
  StarknetConfig,
  useAccount,
  useConnect,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import {
  CallData,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  cairo,
  num,
  wallet,
} from "starknet";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  ArgentIcon,
  BraavosIcon,
  CopyIcon,
  DepositIcon,
  StarknetColorIcon,
  Button,
  CopyAddress,
  Separator,
  LayoutHeader,
} from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "../ErrorAlert";
import { parseEther } from "viem";
import { AmountSelection } from "./AmountSelection";
import { Balance, BalanceType } from "./Balance";
import { TokenPair, usePriceQuery } from "@cartridge/utils/api/cartridge";
import { toast } from "sonner";
import { DEFAULT_AMOUNT } from "./constants";
import { useFeeToken } from "@/hooks/tokens";

type DepositProps = {
  onComplete?: (deployHash?: string) => void;
  onBack: () => void;
};

export function Deposit(innerProps: DepositProps) {
  return (
    <ExternalWalletProvider>
      <DepositInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

function DepositInner({ onComplete, onBack }: DepositProps) {
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { closeModal, controller } = useConnection();
  const { account: extAccount } = useAccount();
  const { token: feeToken } = useFeeToken();

  const [dollarAmount, setDollarAmount] = useState<number>(DEFAULT_AMOUNT);
  const [state, setState] = useState<"connect" | "fund">("connect");
  const [tokenAmount, setTokenAmount] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const priceQuery = usePriceQuery({ pairs: TokenPair.EthUsdc });
  const price = priceQuery.data?.price?.[0];

  const onAmountChanged = useCallback(
    (amount: number) => {
      if (!price) return;

      const tokenAmount = amount / parseFloat(price?.amount);
      setTokenAmount(tokenAmount.toString());
      setDollarAmount(amount);
    },
    [price],
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
    if (!tokenAmount || !controller) {
      return;
    }

    try {
      setIsLoading(true);
      const calls = [
        {
          contractAddress: feeToken.address,
          entrypoint: "approve",
          calldata: CallData.compile({
            recipient: controller.address,
            amount: cairo.uint256(parseEther(tokenAmount)),
          }),
        },
        {
          contractAddress: feeToken.address,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: controller.address,
            amount: cairo.uint256(parseEther(tokenAmount)),
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
  }, [extAccount, controller, tokenAmount, onComplete]);

  const onCopy = useCallback(() => {
    if (!controller) return;

    navigator.clipboard.writeText(controller.address());
    toast.success("Address copied");
  }, [controller]);

  return (
    <LayoutContainer>
      <LayoutHeader
        title="Deposit"
        description={
          controller ? (
            <CopyAddress address={controller.address()} />
          ) : undefined
        }
        icon={<DepositIcon size="lg" />}
        onBack={onBack}
        chainId={controller?.chainId()}
        onClose={closeModal}
      />

      <LayoutContent className="gap-6">
        <Balance types={[BalanceType.FEE_TOKEN]} />
      </LayoutContent>

      <LayoutFooter>
        <AmountSelection
          amount={dollarAmount}
          lockSelection={isLoading}
          onChange={onAmountChanged}
        />
        <Separator className="bg-spacer m-1" />
        {error && (
          <ErrorAlert
            title="Account deployment error"
            description={error.message}
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
                    <div className="text-xs text-muted-foreground font-bold">
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
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      and send funds to it on
                    </div>
                    <div className="flex items-center gap-2 border border-background-100 rounded-md p-2">
                      <StarknetColorIcon />{" "}
                      <div className="text-sm font-bold">Starknet</div>
                    </div>
                  </div>
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
    </LayoutContainer>
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
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    starknet: any;
  }
}
