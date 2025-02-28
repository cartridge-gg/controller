import { useState } from "react";
import { useConnection } from "@/hooks/connection";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  Button,
  CoinsIcon,
  CopyAddress,
  LayoutHeader,
  DepositIcon,
} from "@cartridge/ui-next";
import { Deposit } from "./Deposit";
import { PurchaseCredits } from "./PurchaseCredits";
import { Balance, BalanceType } from "./Balance";

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
      <PurchaseCredits
        isSlot={isSlot}
        onBack={() => setState(FundingState.SHOW_OPTIONS)}
      />
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        title={title || (controller ? `Fund ${controller.username()}` : "")}
        description={
          controller && <CopyAddress address={controller.address()} />
        }
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent className="gap-6">
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
