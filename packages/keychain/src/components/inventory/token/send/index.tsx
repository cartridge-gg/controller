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
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { Call, uint256 } from "starknet";
import { SendRecipient } from "@/components/modules/recipient";
import { SendAmount } from "./amount";
import { createExecuteUrl } from "@/utils/connection/execute";

export function SendToken() {
  const { address: tokenAddress, username } = useParams<{
    address: string;
    username: string;
  }>();
  const [searchParams] = useSearchParams();
  const { navigate } = useNavigation();
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(token);
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

  const onSubmit = useCallback(
    async (to: string, amount: number) => {
      setSubmitted(true);
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
      // Create execute URL with returnTo parameter pointing back to token page
      const executeUrl = createExecuteUrl(calls);

      // Navigate to execute screen with returnTo parameter to come back to token page
      const inventoryPath = `/account/${username}/inventory?${searchParams.toString()}`;
      const executeUrlWithReturn = `${executeUrl}&returnTo=${encodeURIComponent(inventoryPath)}`;
      navigate(executeUrlWithReturn);
      setLoading(false);
    },
    [selectedToken, navigate, username, searchParams],
  );

  if (!token) {
    return null;
  }

  return (
    <>
      <LayoutContent className="pb-4">
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
        {selectedToken && (
          <SendAmount
            token={selectedToken}
            amount={amount}
            submitted={submitted}
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
            isLoading={loading}
            onClick={() => onSubmit(to, amount!)}
          >
            Review Send
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
}
