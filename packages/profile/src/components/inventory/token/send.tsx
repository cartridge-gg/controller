import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";
import { useAccount } from "@/hooks/account";
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
import { validateChecksumAddress } from "starknet";
import { z } from "zod";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { address } = useAccount();
  const t = useToken({ tokenAddress: tokenAddress! });

  const formSchema = useMemo(
    () =>
      z.object({
        to: z
          .string()
          .startsWith("0x")
          .refine(
            (addr) => {
              try {
                return validateChecksumAddress(addr);
              } catch {
                return false;
              }
            },
            { message: "Invalid Starknet address" },
          ),
        amount: z.coerce.number(),
      }),
    [],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values);
  }, []);

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
                      <FormLabel className="text-muted-foreground">
                        Balance:
                      </FormLabel>
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
