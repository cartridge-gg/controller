import { useEffect, useMemo, useState } from "react";
import { Spinner, Token } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { EstimateFee } from "starknet";

import {
  convertTokenAmountToUSD,
  useFeeToken,
  useTokens,
} from "@/hooks/tokens";
import { ErrorAlert } from "./ErrorAlert";
import { ERC20 } from "./provider/tokens";
import { FeeTokenSelect } from "./transaction/fee-token-select";

interface FeesProps {
  isLoading: boolean;
  maxFee?: EstimateFee;
  className?: string;
  discount?: string;
}

export function Fees({
  isLoading: isEstimating,
  maxFee,
  className,
  discount,
}: FeesProps) {
  const { isLoading: isPriceLoading, token, error } = useFeeToken();
  const [formattedFee, setFormattedFee] = useState<string>();
  const isLoading = isEstimating || isPriceLoading;
  const { tokens: _tokens } = useTokens();

  const tokens: Token[] = useMemo(() => {
    return Object.values(_tokens).map((t) => ({
      metadata: { ...t, image: t.icon },
      balance: {
        // Convert bigint into number
        amount: Number(t.balance) / Math.pow(10, t.decimals),
        // Not sure how to convert
        value: Number(t.price?.amount) / Math.pow(10, t.decimals),
        change: t.decimals,
      },
    }));
  }, [_tokens]);

  const defaultToken: Token | null = useMemo(() => {
    if (!token) return null;

    return {
      metadata: {
        ...token,
        image: token.icon || token.contract.metadata().logoUrl || "",
      },
      balance: {
        amount: Number(token?.balance) / Math.pow(10, token?.decimals || 0),
        value:
          Number(token?.price?.amount) / Math.pow(10, token?.decimals || 0),
        change: token?.decimals || 0,
      },
    };
  }, [token]);

  useEffect(() => {
    if (isLoading || error || !token) {
      return;
    }

    if (maxFee && maxFee.overall_fee && token.price) {
      const formatted = convertTokenAmountToUSD(
        maxFee.overall_fee,
        18,
        token.price,
      );
      setFormattedFee(formatted);
    } else {
      setFormattedFee("FREE");
    }
  }, [maxFee, token, error, isLoading]);

  if (error) {
    return (
      <ErrorAlert
        title="Fee estimation error"
        description="Unable to retrieve fee token price"
        variant="error"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full overflow-hidden rounded",
        className,
      )}
    >
      {formattedFee ? (
        <LineItem
          name="Network Fee"
          amount={formattedFee}
          token={token}
          isLoading={isLoading}
          discount={discount}
        />
      ) : (
        <LineItem name="Calculating Fees" isLoading />
      )}
      {defaultToken && (
        <div>
          <FeeTokenSelect
            tokens={tokens}
            defaultToken={defaultToken}
            onSelect={() => {}}
            headerClassName="h-full"
            disabled={true}
          />
        </div>
      )}
    </div>
  );
}

function LineItem({
  name,
  token,
  amount,
  isLoading = false,
  discount,
}: {
  name: string;
  token?: ERC20;
  amount?: string;
  isLoading?: boolean;
  discount?: string;
}) {
  return (
    <div className="flex items-center w-full h-10 py-2.5 px-3 bg-background-125 border border-background-200 rounded">
      <p className="text-sm text-foreground-400 font-medium">{name}</p>
      <div className="flex-1" />

      {isLoading || !token ? (
        <Spinner />
      ) : (
        <div className="flex items-center justify-center gap-4">
          {discount && (
            <div className="-translate-y-1">
              <Union value={discount} variant="secondary" />
            </div>
          )}
          <p className="text-sm text-foreground">
            {amount === "FREE" ? amount : `~${amount}`}
          </p>
        </div>
      )}
    </div>
  );
}

type UnionVariant = "primary" | "secondary";

const Union = ({
  value,
  variant,
}: {
  value?: string;
  variant: UnionVariant;
}) => {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="48"
        height="36"
        viewBox="0 0 48 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.4375 0C1.09131 0 0 0.820418 0 1.83245V35.0824C0 35.7832 1.00383 36.2246 1.81626 35.881L23.4 28.6557C23.5855 28.5772 23.794 28.538 24 28.538C24.206 28.538 24.4145 28.5772 24.6 28.6557L46.1837 35.881C46.9962 36.2246 48 35.7832 48 35.0824V1.83245C48 0.820417 46.9087 0 45.5625 0H2.4375Z"
          fill="url(#paint0_linear_9891_43627)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9891_43627"
            x1="24"
            y1="0"
            x2="24"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="1"
              stopColor={cn(variant === "primary" ? "#11ED83" : "#242824")}
            />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={cn(
          "absolute font-semibold text-xs -translate-y-1/4",
          variant === "secondary" ? "text-[#11ED83]" : "text-[#242824]",
        )}
      >
        {value}
      </span>
    </div>
  );
};
