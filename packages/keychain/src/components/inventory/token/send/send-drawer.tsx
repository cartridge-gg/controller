import { Token, useToken, useTokens } from "@/hooks/token";
import {
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  TokenSelect,
  Spinner,
  PaperPlaneIcon,
  DrawerContent,
  Drawer,
} from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SendRecipient } from "@/components/modules/recipient";
import { SendAmount } from "./amount";
import { Disclosure } from "@cartridge/controller-ui";
import { parseTokenAmount } from "@/utils/token-amount";

export function SendTokenDrawer({
  disclosure,
  tokenAddress,
}: {
  disclosure: Disclosure;
  tokenAddress: string;
}) {
  const [searchParams] = useSearchParams();

  const [validated, setValidated] = useState(false);
  const [warning, setWarning] = useState<string>();
  const { token, status: tokenFetching } = useToken({
    tokenAddress: tokenAddress!,
  });
  const { tokens } = useTokens();
  const userSelectedToken = useRef(false);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number | undefined>();
  const [amountInput, setAmountInput] = useState<string | undefined>();
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [toError, setToError] = useState<Error | undefined>();
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(token);
  const [recipientLoading, setRecipientLoading] = useState(false);

  const url = useMemo(() => {
    if (
      recipientLoading ||
      !!toError ||
      !!amountError ||
      (!validated && !!warning) ||
      !selectedToken ||
      !amount ||
      !to
    ) {
      return "";
    } else {
      const baseUnitAmount = parseTokenAmount(
        amountInput,
        selectedToken.metadata.decimals,
      );
      if (baseUnitAmount === undefined) {
        return "";
      }

      const sendParams = new URLSearchParams(searchParams);
      sendParams.set("tokenAddress", tokenAddress);
      sendParams.set("recipient", to);
      sendParams.set("amount", baseUnitAmount.toString());
      return `send?${sendParams.toString()}`;
    }
  }, [
    validated,
    warning,
    amountError,
    toError,
    recipientLoading,
    amount,
    amountInput,
    to,
    searchParams,
    tokenAddress,
    selectedToken,
  ]);

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
      setAmountInput(undefined);
      userSelectedToken.current = true;
    },
    [setSelectedToken, setAmount, setAmountInput],
  );

  if (!token) {
    return null;
  }

  return (
    <Drawer isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
      <DrawerContent
        title="Send"
        icon={<PaperPlaneIcon size="lg" variant="solid" />}
      >
        <div className="flex items-center gap-3 absolute top-4 left-[130px]">
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
            setAmountInput={setAmountInput}
            setError={setAmountError}
          />
        )}

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

        <div className="flex flex-row items-center gap-3"></div>

        <Link to={url} className="w-full">
          <Button disabled={!url} type="submit" className="w-full">
            Review Send
          </Button>
        </Link>
      </DrawerContent>
    </Drawer>
  );
}
