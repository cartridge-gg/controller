// import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  ControllerIcon,
  HeaderInner,
} from "@cartridge/controller-ui";
import { Balance, BalanceType } from "./Balance";
import { DepositCredits } from "./DepositCredits";
import { useState } from "react";

export type FundingProps = {
  title?: React.ReactElement | string;
  isSlot?: boolean;
};

export function Funding({ title, isSlot }: FundingProps) {
  const { controller } = useConnection();
  // const { navigate } = useNavigation();
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const balances: BalanceType[] = isSlot
    ? [BalanceType.CREDITS]
    : [BalanceType.CREDITS, BalanceType.FEE_TOKEN];

  return (
    <>
      <HeaderInner
        title={
          typeof title === "string"
            ? title
            : controller
              ? `Add funds for ${controller.username()}`
              : ""
        }
        icon={<ControllerIcon size="lg" />}
        hideIcon
      />
      <LayoutContent>
        <Balance types={balances} />
      </LayoutContent>
      <LayoutFooter>
        {!isSlot && (
          <Button
            onClick={() => {
              setIsDepositOpen(true);
              // navigate("/funding/deposit")
            }}
          >
            Deposit
          </Button>
        )}
      </LayoutFooter>
      <DepositCredits
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </>
  );
}
