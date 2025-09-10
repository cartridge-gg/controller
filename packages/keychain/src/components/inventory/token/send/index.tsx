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
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { Call, uint256, FeeEstimate } from "starknet";
import { SendRecipient } from "@/components/modules/recipient";
import { SendAmount } from "./amount";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { toast } from "sonner";

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
  const [amount, setAmount] = useState<number | undefined>();
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [toError, setToError] = useState<Error | undefined>();
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(token);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);

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

  const onSubmitSend = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !transactions || !controller) {
        return;
      }

      try {
        await controller.execute(transactions, maxFee);

        toast.success("Tokens sent successfully!", {
          duration: 10000,
        });

        // Navigate back to inventory
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to send tokens");
        throw error;
      }
    },
    [transactions, controller, goBack],
  );

  if (!token) {
    return null;
  }

  return (
    <>
      {sendConfirmed && transactions ? (
        <ExecutionContainer
          title="Confirm Send"
          icon={
            <PaperPlaneIcon
              variant="solid"
              size="lg"
              className="h-[30px] w-[30px]"
            />
          }
          transactions={transactions}
          onSubmit={onSubmitSend}
          buttonText="Send"
        >
          <div className="p-6 pb-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <p className="text-semibold text-lg">Sending</p>
              {selectedToken && (
                <div className="flex items-center gap-2">
                  <Thumbnail icon={selectedToken.metadata.image} size="sm" />
                  <p className="text-sm font-medium">
                    {selectedToken.metadata.symbol}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground-400">
                Recipient
              </p>
              <p className="text-sm font-mono text-foreground-100">{to}</p>
            </div>
            {selectedToken && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground-400">
                  Amount
                </p>
                <p className="text-lg font-medium text-foreground-100">
                  {amount} {selectedToken.metadata.symbol}
                </p>
              </div>
            )}
          </div>
        </ExecutionContainer>
      ) : (
        <>
          <LayoutContent className="pb-4 gap-6">
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
