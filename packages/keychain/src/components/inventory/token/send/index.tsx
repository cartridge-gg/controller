import { Token, useToken, useTokens } from "@/hooks/token";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  Thumbnail,
  TokenSelect,
  Spinner,
  PaperPlaneIcon,
  WalletType,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { Call, uint256, FeeEstimate } from "starknet";
import { SendRecipient } from "@/components/modules/recipient";
import { RecipientCard } from "@/components/modules/RecipientCard";
import { SendAmount } from "./amount";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useToast } from "@/context/toast";

export function SendToken() {
  const { address: tokenAddress } = useParams<{
    address: string;
  }>();
  const { controller } = useConnection();
  const { goBack } = useNavigation();
  const [validated, setValidated] = useState(false);
  const [warning, setWarning] = useState<string>();
  const { token, status: tokenFetching } = useToken({
    tokenAddress: tokenAddress!,
  });
  const { tokens } = useTokens();
  const userSelectedToken = useRef(false);

  const [to, setTo] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientWalletType, setRecipientWalletType] = useState<
    WalletType | undefined
  >();
  const [amount, setAmount] = useState<number | undefined>();
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [toError, setToError] = useState<Error | undefined>();
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(token);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);
  const { toast } = useToast();

  const disabled = useMemo(() => {
    return (
      recipientLoading ||
      !!toError ||
      !!amountError ||
      (!validated && !!warning) ||
      !amount
    );
  }, [validated, warning, amountError, toError, recipientLoading, amount]);

  useEffect(() => {
    setValidated(false);
  }, [warning, setValidated]);

  useEffect(() => {
    if (!userSelectedToken.current && token) {
      setSelectedToken(token);
    }
  }, [token]);

  const onChangeToken = useCallback(
    (token: Token) => {
      setSelectedToken(token);
      setAmount(undefined);
      userSelectedToken.current = true;
    },
    [setSelectedToken, setAmount],
  );

  const onRecipientSelected = useCallback(
    (data: { name: string; address: string; walletType: WalletType }) => {
      setRecipientName(data.name);
      setRecipientWalletType(data.walletType);
    },
    [],
  );

  // Build transactions when send is confirmed
  const transactions = useMemo(() => {
    if (
      !sendConfirmed ||
      !selectedToken ||
      !to ||
      !amount ||
      !!toError ||
      !!amountError
    ) {
      return undefined;
    }

    const formattedAmount = uint256.bnToUint256(
      BigInt(amount * 10 ** selectedToken.metadata.decimals),
    );

    const calls: Call[] = [
      {
        contractAddress: selectedToken.metadata.address,
        entrypoint: "transfer",
        calldata: [to, formattedAmount],
      },
    ];

    return calls;
  }, [sendConfirmed, selectedToken, to, amount, toError, amountError]);

  const submitToast = useCallback(() => {
    toast.marketplace("Tokens sent successfully!", {
      action: "sent",
      itemNames: [`${amount} ${selectedToken?.metadata.name ?? ""}`],
      itemImages: [selectedToken?.metadata.image ?? ""],
      collectionName: selectedToken?.metadata.name ?? "",
    });
  }, [toast, amount, selectedToken?.metadata]);

  const onSubmitSend = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !transactions || !controller) {
        return;
      }

      try {
        await controller.execute(transactions, maxFee);
        submitToast();
        // Navigate back to inventory
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to send tokens");
        throw error;
      }
    },
    [transactions, controller, goBack, toast, submitToast],
  );

  if (!token) {
    return null;
  }

  return (
    <>
      {sendConfirmed && transactions ? (
        <ExecutionContainer
          title="Review Transaction"
          icon={
            <PaperPlaneIcon
              variant="solid"
              size="lg"
              className="h-[30px] w-[30px]"
            />
          }
          transactions={transactions}
          onSubmit={onSubmitSend}
          buttonText="Confirm"
        >
          <div className="p-6 flex flex-col gap-6">
            <RecipientCard
              address={to}
              name={recipientName || undefined}
              walletType={recipientWalletType}
            />
            {selectedToken && (
              <div className="flex flex-col gap-px rounded-[4px] overflow-hidden">
                <div className="bg-background-200 box-border flex gap-1 items-center justify-start p-3">
                  <p className="text-foreground-400 text-xs font-semibold tracking-[0.24px]">
                    Sending
                  </p>
                </div>
                <div className="bg-background-200 box-border flex gap-3 h-16 items-center justify-start overflow-hidden p-3">
                  <div className="bg-background-300 box-border flex gap-2.5 items-center justify-center p-[3px] relative rounded-[20px] shrink-0">
                    <Thumbnail
                      icon={selectedToken.metadata.image}
                      size="sm"
                      className="!w-[34px] !h-[34px]"
                    />
                  </div>
                  <div className="basis-0 content-stretch flex flex-col gap-0.5 grow items-start justify-start min-h-px min-w-px relative shrink-0">
                    <div className="content-stretch flex font-medium items-center justify-between leading-[0] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white w-full">
                      <div className="flex flex-col justify-center relative shrink-0">
                        <p className="leading-[20px] text-nowrap whitespace-pre">
                          {selectedToken.metadata.symbol}
                        </p>
                      </div>
                      <div className="flex flex-col justify-center relative shrink-0">
                        <p className="leading-[20px] text-nowrap whitespace-pre">
                          $
                          {amount && selectedToken.balance.value
                            ? (
                                amount *
                                (selectedToken.balance.value /
                                  selectedToken.balance.amount)
                              ).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-0.5 items-start justify-start relative shrink-0 w-full">
                      <div className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-foreground-300 text-center text-nowrap">
                        <p className="leading-[16px] whitespace-pre">
                          {amount} {selectedToken.metadata.symbol}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ExecutionContainer>
      ) : (
        <>
          <LayoutContent>
            <div className="flex items-center gap-3">
              <Thumbnail
                icon={
                  <PaperPlaneIcon
                    variant="solid"
                    className="h-[30px] w-[30px]"
                  />
                }
                size="lg"
              />
              <p className="text-semibold text-lg">Send</p>
              {tokenFetching === "loading" ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : (
                <TokenSelect
                  tokens={tokens.filter((item) => item.balance.amount > 0)}
                  onSelect={onChangeToken}
                  defaultToken={selectedToken}
                />
              )}
            </div>
            <SendRecipient
              to={to}
              submitted={false}
              setTo={setTo}
              setWarning={setWarning}
              setError={setToError}
              setParentLoading={setRecipientLoading}
              onRecipientSelected={onRecipientSelected}
            />
            {selectedToken && (
              <SendAmount
                token={selectedToken}
                amount={amount}
                submitted={false}
                setAmount={setAmount}
                setError={setAmountError}
              />
            )}
          </LayoutContent>

          <LayoutFooter>
            <div
              className={cn(
                "border border-destructive-100 rounded flex items-center gap-2 p-2 cursor-pointer select-none",
                !warning && "hidden",
              )}
              onClick={() => setValidated(!validated)}
            >
              {validated && (
                <CheckboxCheckedIcon className="text-destructive-100 min-h-5 min-w-5 hover:opacity-80" />
              )}
              {!validated && (
                <CheckboxUncheckedIcon className="text-destructive-100 min-h-5 min-w-5 hover:opacity-80" />
              )}
              <p className="text-xs text-destructive-100">{warning}</p>
            </div>
            <div className="flex flex-row items-center gap-3">
              <Button
                disabled={disabled}
                type="submit"
                className="w-full"
                onClick={() => setSendConfirmed(true)}
              >
                Review Send
              </Button>
            </div>
          </LayoutFooter>
        </>
      )}
    </>
  );
}
