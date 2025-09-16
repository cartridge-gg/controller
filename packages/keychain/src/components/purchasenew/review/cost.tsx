import {
  Card,
  CardContent,
  cn,
  CreditIcon,
  InfoIcon,
  Thumbnail,
} from "@cartridge/ui";
import { CostDetails } from "../types";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";
import { FeesTooltip } from "./tooltip";
import { WALLET_CONFIG } from "@/components/purchase/CryptoCheckout";
import React, { ComponentProps } from "react";

type PaymentRails = "stripe" | "crypto";
type PaymentUnit = "usdc" | "credits";

export const convertCentsToDollars = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export interface CostBreakdownProps {
  items?: Record<string, string>;
  rails: PaymentRails;
  costDetails?: CostDetails;
  walletType?: ExternalWalletType;
  platform?: ExternalPlatform;
  paymentUnit?: PaymentUnit;
  openFeesTooltip?: boolean;
}

export const CostBreakdown = React.forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Card> & CostBreakdownProps
>(
  (
    {
      className,
      rails,
      costDetails,
      walletType,
      platform,
      paymentUnit,
      openFeesTooltip = false,
      ...props
    },
    ref,
  ) => {
    if (rails === "crypto" && !walletType) {
      return;
    }

    if (!costDetails) {
      return <></>;
    }

    return (
      <Card ref={ref} className={cn("gap-3", className)} {...props}>
        {rails === "crypto" && platform && (
          <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
            <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
              Purchase on <Network walletType={walletType} />
            </div>
          </CardContent>
        )}

        <div className="flex flex-row gap-3 h-[40px]">
          <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400 w-full">
            <div className="flex justify-between text-sm font-medium w-full">
              <div className="flex flex-row items-center gap-1">
                <span>Total</span>
                {costDetails.processingFeeInCents > 0 && (
                  <FeesTooltip
                    trigger={<InfoIcon size="xs" />}
                    isStripe={rails === "stripe"}
                    defaultOpen={openFeesTooltip}
                    costDetails={costDetails}
                  />
                )}
              </div>
              <span className="text-foreground-100">
                {convertCentsToDollars(costDetails.totalInCents)}
              </span>
            </div>
          </CardContent>
          <PaymentType unit={paymentUnit} />
        </div>
      </Card>
    );
  },
);

const PaymentType = ({ unit }: { unit?: PaymentUnit }) => {
  if (!unit) {
    return <></>;
  }

  return (
    <CardContent className="flex items-center px-3 bg-background-200 gap-2 rounded-[4px] text-sm font-medium">
      <Thumbnail
        size="sm"
        icon={
          unit === "usdc" ? (
            "https://static.cartridge.gg/tokens/usdc.svg"
          ) : (
            <CreditIcon />
          )
        }
        variant="light"
        rounded
      />
      {unit.toUpperCase()}
    </CardContent>
  );
};

const Network = ({ walletType }: { walletType?: ExternalWalletType }) => {
  if (walletType) {
    const NetworkIcon =
      WALLET_CONFIG[walletType as keyof typeof WALLET_CONFIG].networkIcon;

    return (
      <>
        <NetworkIcon size="xs" className="inline-block" />
        {WALLET_CONFIG[walletType as keyof typeof WALLET_CONFIG].network}
      </>
    );
  }

  return null;
};
