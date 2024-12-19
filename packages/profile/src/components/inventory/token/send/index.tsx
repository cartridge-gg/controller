import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";
import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/context";
import { useToken } from "@/hooks/token";
import {
  ArrowIcon,
  Button,
  CheckboxCheckedDuoIcon,
  CheckboxUncheckedIcon,
  cn,
  CopyAddress,
  Separator,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Call, uint256 } from "starknet";
import { Recipient } from "./recipient";
import { Amount } from "./amount";

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

  // const formSchema = useMemo(() => {
  //   // Avoid scientific notation in error message (e.g. `parseFloat(`1e-${decimals}`).toString() === "1e-18"`)
  //   const decimals = token?.meta.decimals ?? 18;
  //   const minAmountStr = `0.${"0".repeat(decimals - 1)}1`;

  //   return z.object({
  //     to: z
  //       .string()
  //       .startsWith("0x", {
  //         message: 'Starknet address must start with "0x"',
  //       })
  //       .min(62, {
  //         message: "Starknet address must be at least 61 characters long",
  //       })
  //       .refine(
  //         (addr) => {
  //           try {
  //             return BigInt(addr) < constants.PRIME;
  //           } catch {
  //             return false;
  //           }
  //         },
  //         {
  //           message: "Please input a valid Starknet address",
  //         },
  //       ),
  //     amount: z.coerce
  //       .number({ message: "Amount is required" })
  //       .gte(parseFloat(minAmountStr), {
  //         message: `Amount must be at least ${minAmountStr} ${token?.meta.symbol}`,
  //       })
  //       .refine((x) => BigInt(x * 10 ** decimals) <= (token?.balance.value ?? 0n), {
  //         message: "Amount cannot exceed balance",
  //       }),
  //   });
  // }, [token]);

  // const form = useForm<z.infer<typeof formSchema>>({
  //   mode: "onBlur",
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     to: "",
  //   },
  // });

  const disabled = useMemo(() => {
    return (!validated && !!warning) || !to || !amount;
  }, [validated, to, amount, warning]);

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
      // Remove 3 sub routes from the path
      navigate("../../..");
    },
    [token, parent, navigate],
  );

  if (!token) {
    return null;
  }

  return (
    <LayoutContainer
      left={
        <Link to="..">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={`Send ${token.meta.symbol}`}
        description={<CopyAddress address={address} />}
        icon={
          <img
            className="w-8 h-8"
            src={token.meta.logoUrl ?? "/public/placeholder.svg"}
          />
        }
      />
      <LayoutContent className="pb-4 gap-6">
        <Recipient to={to} setTo={setTo} setWarning={setWarning} />
        <Amount amount={amount} setAmount={setAmount} />
      </LayoutContent>

      <LayoutFooter>
        <Separator className="bg-spacer" />
        <div
          className={cn(
            "border border-destructive rounded flex items-center gap-2 p-2 cursor-pointer select-none",
            !warning && "hidden",
          )}
          onClick={() => setValidated(!validated)}
        >
          {validated && (
            <CheckboxCheckedDuoIcon className="text-destructive min-h-5 min-w-5 hover:opacity-80" />
          )}
          {!validated && (
            <CheckboxUncheckedIcon className="text-destructive min-h-5 min-w-5 hover:opacity-80" />
          )}
          <p className="text-xs text-destructive">{warning}</p>
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
