import { useState } from "react";
import { NavigationHeader } from "@/components";
import { useConnection } from "@/hooks/connection";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  Button,
  CoinsIcon,
  ControllerIcon,
} from "@cartridge/ui";
import { Deposit } from "./Deposit";
import { Purchase } from "../purchase";
import { Balance, BalanceType } from "../purchase/Balance";
import { PurchaseType } from "@/hooks/payments/crypto";

const enum FundingState {
  SHOW_OPTIONS,
  FUND_CREDITS,
  FUND_ETH,
}

export type FundingProps = {
  title?: React.ReactElement | string;
  isSlot?: boolean;
  onComplete?: (deployHash?: string) => void;
};

export function Funding({ title, isSlot, onComplete }: FundingProps) {
  const { controller } = useConnection();
  const [state, setState] = useState<FundingState>(FundingState.SHOW_OPTIONS);
  const balances: BalanceType[] = isSlot
    ? [BalanceType.CREDITS]
    : [BalanceType.CREDITS, BalanceType.FEE_TOKEN];
  const showCredits =
    (typeof document !== "undefined" && document.cookie.includes("credits=")) ||
    isSlot;

  if (state === FundingState.FUND_ETH) {
    return (
      <Deposit
        onComplete={onComplete}
        onBack={() => setState(FundingState.SHOW_OPTIONS)}
      />
    );
  }

  if (state === FundingState.FUND_CREDITS) {
    return (
      <Purchase
        type={PurchaseType.CREDITS}
        isSlot={isSlot}
        onBack={() => setState(FundingState.SHOW_OPTIONS)}
      />
    );
  }

  return (
    <LayoutContainer>
      <NavigationHeader
        className="p-6"
        title={
          typeof title === "string"
            ? title
            : controller
              ? `Fund ${controller.username()}`
              : ""
        }
        icon={<ControllerIcon size="lg" />}
      />
      <LayoutContent className="gap-6 px-6">
        <Balance types={balances} />
      </LayoutContent>
      <LayoutFooter>
        {showCredits && (
          <Button onClick={() => setState(FundingState.FUND_CREDITS)}>
            <CoinsIcon variant="line" size="sm" /> Purchase Credits
          </Button>
        )}
        {!isSlot && (
          <Button
            onClick={() => setState(FundingState.FUND_ETH)}
            variant="secondary"
          >
            Deposit
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}
