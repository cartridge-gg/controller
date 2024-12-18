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
  CopyAddress,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@cartridge/ui-next";
import { useCountervalue } from "@cartridge/utils";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Call, constants, uint256 } from "starknet";
import { z } from "zod";
import { formatBalance } from "./helper";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { address } = useAccount();
  const { parent } = useConnection();
  const t = useToken({ tokenAddress: tokenAddress! });
  const navigate = useNavigate();

  const formSchema = useMemo(() => {
    // Avoid scientific notation in error message (e.g. `parseFloat(`1e-${decimals}`).toString() === "1e-18"`)
    const decimals = t?.meta.decimals ?? 18;
    const minAmountStr = `0.${"0".repeat(decimals - 1)}1`;

    return z.object({
      to: z
        .string()
        .startsWith("0x", {
          message: 'Starknet address must start with "0x"',
        })
        .min(62, {
          message: "Starknet address must be at least 61 characters long",
        })
        .refine(
          (addr) => {
            try {
              return BigInt(addr) < constants.PRIME;
            } catch {
              return false;
            }
          },
          {
            message: "Please input a valid Starknet address",
          },
        ),
      amount: z.coerce
        .number({ message: "Amount is required" })
        .gte(parseFloat(minAmountStr), {
          message: `Amount must be at least ${minAmountStr} ${t?.meta.symbol}`,
        })
        .refine((x) => BigInt(x * 10 ** decimals) <= (t?.balance.value ?? 0n), {
          message: "Amount cannot exceed balance",
        }),
    });
  }, [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
    },
  });

  const handleMax = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();
      if (!t) return;
      form.setValue("amount", parseFloat(t.balance.formatted));
    },
    [t, form],
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (!t) return;

      const amount = uint256.bnToUint256(
        BigInt(values.amount * 10 ** t.meta.decimals),
      );

      const calls: Call[] = [
        {
          contractAddress: t.meta.address,
          entrypoint: "transfer",
          calldata: [values.to, amount],
        },
      ];
      await parent.openExecute(calls);
      // Remove 3 sub routes from the path
      navigate("../../..");
    },
    [t, parent, navigate],
  );

  const amount = form.watch("amount");

  const { countervalue } = useCountervalue(
    {
      balance: amount?.toString(),
      pair: `${t?.meta.symbol}_USDC` as TokenPair,
    },
    { enabled: t && ["ETH", "STRK"].includes(t.meta.symbol) && !!amount },
  );

  if (!t) {
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
        title={`Send ${t.meta.symbol}`}
        description={<CopyAddress address={address} />}
        icon={
          <img
            className="w-8 h-8"
            src={t.meta.logoUrl ?? "/public/placeholder.svg"}
          />
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <LayoutContent className="pb-4 gap-8">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="Destination Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Amount</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormLabel>Balance:</FormLabel>
                      <div
                        className="text-xs cursor-pointer hover:opacity-90"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                          handleMax(e)
                        }
                      >
                        {formatBalance(t.balance.formatted, ["~"])}{" "}
                        {t.meta.symbol}
                      </div>
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder={(0.01).toLocaleString()}
                        {...field}
                        value={field.value ?? ""}
                        className="[&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {countervalue && (
                        <span className="absolute right-14 top-3.5 text-sm text-muted-foreground">
                          {formatBalance(countervalue.formatted)}
                        </span>
                      )}
                      <Button
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs/3 font-bold uppercase px-2 py-1.5 h-7 bg-muted text-secondary-foreground hover:opacity-70"
                        variant="ghost"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleMax(e)
                        }
                      >
                        Max
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </LayoutContent>

          <LayoutFooter>
            <Button type="submit" className="w-full">
              Review Send
            </Button>
          </LayoutFooter>
        </form>
      </Form>
    </LayoutContainer>
  );
}
