import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/context";
import { useToken } from "@/hooks/token";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  cn,
  CopyAddress,
  Separator,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Call, uint256 } from "starknet";
import { SendRecipient } from "@/components/modules/recipient";
import { SendAmount } from "./amount";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { address } = useAccount();
  const { parent } = useConnection();
  const [validated, setValidated] = useState(false);
  const [warning, setWarning] = useState<string>();
  const token = useToken({ tokenAddress: tokenAddress! });
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState<number | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const disabled = useMemo(() => {
    return (
      !!error || (!validated && !!warning) || !to || !amount || amount <= 0
    );
  }, [validated, to, amount, warning, error]);

  useEffect(() => {
    setValidated(false);
  }, [warning, setValidated]);

  const onSubmit = useCallback(
    async (to: string, amount: number) => {
      if (!token) return;

      const formattedAmount = uint256.bnToUint256(
        BigInt(amount * 10 ** token.meta.decimals),
      );

      const calls: Call[] = [
        {
          contractAddress: token.meta.address,
          entrypoint: "transfer",
          calldata: [to, formattedAmount],
        },
      ];
      await parent.openExecute(calls);
      navigate("../../..");
    },
    [token, parent, navigate],
  );

  if (!token) {
    return null;
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        title={`Send ${token.meta.symbol}`}
        description={<CopyAddress address={address} size="sm" />}
        icon={
          <div className="rounded-full size-11 bg-foreground-100 flex items-center justify-center">
            <img
              className="w-10 h-10"
              src={token.meta.logoUrl ?? "/public/placeholder.svg"}
            />
          </div>
        }
        onBack={() => {
          navigate("..");
        }}
      />
      <LayoutContent className="pb-4 gap-6">
        <SendRecipient to={to} setTo={setTo} setWarning={setWarning} />
        <SendAmount amount={amount} setAmount={setAmount} setError={setError} />
      </LayoutContent>

      <LayoutFooter>
        <Separator className="bg-spacer" />
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
          onClick={() => onSubmit(to, amount!)}
        >
          Review Send
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
