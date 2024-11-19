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
import { CurrencyBase, CurrencyQuote } from "@cartridge/utils/api/cartridge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { constants } from "starknet";
import { z } from "zod";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { address } = useAccount();
  const { parent } = useConnection();
  const t = useToken({ tokenAddress: tokenAddress! });

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

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!t) return;

      const amount = (values.amount * 10 ** t.meta.decimals).toString();

      parent.openExecute([
        {
          contractAddress: t?.meta.address,
          entrypoint: "increaseAllowance",
          calldata: [values.to, amount, "0x0"],
        },
        {
          contractAddress: t?.meta.address,
          entrypoint: "transfer",
          calldata: [values.to, amount, "0x0"],
        },
      ]);
    },
    [t, parent],
  );

  const amount = form.watch("amount");

  const { countervalue } = useCountervalue(
    {
      balance: amount?.toString(),
      quote: CurrencyQuote.Eth,
      base: CurrencyBase.Usd,
    },
    { enabled: t?.meta.symbol === "ETH" && !!amount },
  );

  if (!t) {
    return;
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
        title={`Send ${t.meta.name}`}
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
                      <div className="text-xs">
                        {t.balance.formatted} {t.meta.symbol}
                      </div>
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.01"
                        {...field}
                        value={field.value ?? ""}
                        className="[&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {countervalue && (
                        <span className="absolute right-4 top-3.5 text-sm text-muted-foreground">
                          ~${countervalue.formatted}
                        </span>
                      )}
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
