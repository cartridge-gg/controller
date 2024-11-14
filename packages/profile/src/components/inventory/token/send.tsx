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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { address } = useAccount();
  const t = useToken({ tokenAddress: tokenAddress! });

  const formSchema = useMemo(
    () =>
      z.object({
        to: z.string(),
        amount: z.number(),
      }),
    [],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

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
          <LayoutContent className="pb-4">
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.01" {...field} />
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
