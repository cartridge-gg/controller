import { useConnection } from "#hooks/context";
import { Token, useToken, useTokens } from "#hooks/token";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  cn,
  Thumbnail,
  TokenSelect,
  Spinner,
  PaperPlaneIcon,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Call,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  uint256,
} from "starknet";
import { SendRecipient } from "#components/modules/recipient";
import { SendAmount } from "./amount";
import { useData } from "#hooks/context";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { parent, provider, closable } = useConnection();
  const [validated, setValidated] = useState(false);
  const [warning, setWarning] = useState<string>();
  const { token, status: tokenFetching } = useToken({
    tokenAddress: tokenAddress!,
  });
  const { tokens } = useTokens();

  const { refetchTransfers } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number | undefined>();
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [toError, setToError] = useState<Error | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>();
  const [recipientLoading, setRecipientLoading] = useState(false);

  const disabled = useMemo(() => {
    return (
      recipientLoading ||
      !!toError ||
      !!amountError ||
      (!validated && !!warning)
    );
  }, [validated, warning, amountError, toError, recipientLoading]);

  useEffect(() => {
    setValidated(false);
  }, [warning, setValidated]);

  const onChangeToken = useCallback(
    (token: Token) => {
      setSelectedToken(token);
      // Reset amount when token changes
      setAmount(undefined);
    },
    [setSelectedToken, setAmount],
  );

  const onSubmit = useCallback(
    async (to: string, amount: number) => {
      setSubmitted(true);
      setLoading(true);
      if (!selectedToken || !to || !amount) return;

      setLoading(true);
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
      try {
        const res = await parent.openExecute(calls);
        if (res?.transactionHash) {
          await provider.waitForTransaction(res.transactionHash, {
            retryInterval: 1000,
            successStates: [
              TransactionExecutionStatus.SUCCEEDED,
              TransactionFinalityStatus.ACCEPTED_ON_L2,
            ],
          });
          // Refetch transfers after 5 seconds to leave time to the indexer to take the new tx into account
          setTimeout(() => {
            refetchTransfers();
          }, 5000);
        }
        if (closable) {
          navigate(`..?${searchParams.toString()}`);
        } else {
          navigate(`../../..?${searchParams.toString()}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      selectedToken,
      provider,
      parent,
      closable,
      navigate,
      searchParams,
      refetchTransfers,
    ],
  );

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  if (!token) {
    return null;
  }

  return (
    <LayoutContainer>
      <LayoutHeader className="hidden" onBack={handleBack} />
      <LayoutContent className="pb-4 gap-6">
        <div className="flex items-center gap-3">
          <Thumbnail
            icon={
              <PaperPlaneIcon variant="solid" className="h-[30px] w-[30px]" />
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
          submitted={submitted}
          setTo={setTo}
          setWarning={setWarning}
          setError={setToError}
          setParentLoading={setRecipientLoading}
        />
        <SendAmount
          token={selectedToken || token}
          amount={amount}
          submitted={submitted}
          setAmount={setAmount}
          setError={setAmountError}
        />
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
            variant="secondary"
            type="button"
            className="w-fit"
            isLoading={loading}
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button
            disabled={disabled}
            type="submit"
            className="w-full"
            isLoading={loading}
            onClick={() => onSubmit(to, amount!)}
          >
            Review Send
          </Button>
        </div>
      </LayoutFooter>
    </LayoutContainer>
  );
}
