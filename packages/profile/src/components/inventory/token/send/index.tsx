import { useConnection } from "#hooks/context";
import { useToken } from "#hooks/token";
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

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { parent, provider, closable } = useConnection();
  const [validated, setValidated] = useState(false);
  const [warning, setWarning] = useState<string>();
  const { token } = useToken({ tokenAddress: tokenAddress! });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number | undefined>();
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [toError, setToError] = useState<Error | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const onSubmit = useCallback(
    async (to: string, amount: number) => {
      setSubmitted(true);
      if (!token || !to || !amount) return;

      setLoading(true);
      const formattedAmount = uint256.bnToUint256(
        BigInt(amount * 10 ** token.metadata.decimals),
      );

      const calls: Call[] = [
        {
          contractAddress: token.metadata.address,
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
    [token, provider, parent, closable, navigate, searchParams],
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
        <div className="flex items-center gap-4">
          <Thumbnail icon={token.metadata.image} size="lg" rounded />
          <p className="text-semibold text-lg/[22px]">{`Send ${token.metadata.symbol ?? "Token"}`}</p>
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
        <Button
          disabled={disabled}
          type="submit"
          className="w-full"
          isLoading={loading}
          onClick={() => onSubmit(to, amount!)}
        >
          Review Send
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
