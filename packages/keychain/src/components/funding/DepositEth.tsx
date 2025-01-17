import { Container, Content, Footer } from "@/components/layout";
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
  ArgentIcon,
  BraavosIcon,
  CopyIcon,
  EthereumIcon,
  StarknetColorIcon,
  Button,
  CopyAddress,
  Separator,
} from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "../ErrorAlert";
import { parseEther } from "viem";
import { AmountSelection } from "./AmountSelection";
import { Balance } from "./Balance";
import { TokenPair, usePriceQuery } from "@cartridge/utils/api/cartridge";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";
import { toast } from "sonner";
import { DEFAULT_AMOUNT } from "./constants";

type DepositEthProps = {
  onComplete?: (deployHash?: string) => void;
  onBack: () => void;
};

export function DepositEth(innerProps: DepositEthProps) {
  return (
    <ExternalWalletProvider>
      <DepositEthInner {...innerProps} />
    </ExternalWalletProvider>
  );
}

function DepositEthInner({ onComplete, onBack }: DepositEthProps) {
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { controller, chainId } = useConnection();
  const { account: extAccount } = useAccount();

  const [dollarAmount, setDollarAmount] = useState<number>(DEFAULT_AMOUNT);
  const [state, setState] = useState<"connect" | "fund">("connect");
  const [ethAmount, setEthAmount] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const priceQuery = usePriceQuery({ pairs: TokenPair.EthUsdc });
  const price = priceQuery.data?.price?.[0];

  const onAmountChagned = useCallback(
    (amount: number) => {
      if (!price) return;

      const ethAmount = amount / parseFloat(price?.amount);
      setEthAmount(ethAmount.toString());
      setDollarAmount(amount);
    },
    [price],
  );

  const onConnect = useCallback(
    (c: Connector) => {
      if (!chainId) return;

      connectAsync({ connector: c })
        .then(async () => {
          const connectedChain = await c.chainId();
          if (num.toHex(connectedChain) !== chainId) {
            await wallet.switchStarknetChain(window.starknet, chainId);
          }

          setState("fund");
        })
        .catch(() => {
          /* user abort */
        });
    },
    [connectAsync, chainId],
  );

  const onFund = useCallback(async () => {
    if (!extAccount) {
      throw new Error("External account is not connected");
    }
    if (!ethAmount || !controller) {
      return;
    }

    try {
      setIsLoading(true);
      const calls = [
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "approve",
          calldata: CallData.compile({
            recipient: controller.address,
            amount: cairo.uint256(parseEther(ethAmount)),
          }),
        },
        {
          contractAddress: ETH_CONTRACT_ADDRESS,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: controller.address,
            amount: cairo.uint256(parseEther(ethAmount)),
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
  }, [extAccount, controller, ethAmount, onComplete]);

  const onCopy = useCallback(() => {
    if (!controller?.address) return;

    navigator.clipboard.writeText(controller.address);
    toast.success("Address copied");
  }, [controller?.address]);

  return (
    <Container
      title="Deposit ETH"
      description={
        controller ? <CopyAddress address={controller.address} /> : undefined
      }
      Icon={EthereumIcon}
      onBack={onBack}
    >
      <Content className="gap-6">
        <Balance showBalances={["eth"]} />
      </Content>

      <Footer>
        <AmountSelection
          amount={dollarAmount}
          lockSelection={isLoading}
          onChange={onAmountChagned}
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
                    <div className="text-xs text-quaternary-foreground font-bold">
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
                    <div className="text-sm text-quaternary-foreground">
                      and send funds to it on
                    </div>
                    <div className="flex items-center gap-2 border border-secondary rounded-md p-1">
                      <StarknetColorIcon />{" "}
                      <div className="text-sm font-bold">STARKNET MAINNET</div>
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
      </Footer>
    </Container>
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
      provider={() => controller}
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
