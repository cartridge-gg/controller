import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  ControllerIcon,
  HeaderInner,
} from "@cartridge/ui";
import { Balance, BalanceType } from "../purchase/Balance";

export type FundingProps = {
  title?: React.ReactElement | string;
  isSlot?: boolean;
};

export function Funding({ title, isSlot }: FundingProps) {
  const { controller } = useConnection();
  const { navigate } = useNavigation();

  const balances: BalanceType[] = isSlot
    ? [BalanceType.CREDITS]
    : [BalanceType.CREDITS, BalanceType.FEE_TOKEN];
  const showCredits =
    (typeof document !== "undefined" && document.cookie.includes("credits=")) ||
    isSlot;

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
        {showCredits && (
          <Button onClick={() => navigate("/funding/credits")}>
            Purchase Credits
          </Button>
        )}
        {!isSlot && (
          <Button
            onClick={() => navigate("/funding/deposit")}
            variant="secondary"
          >
            Deposit
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}
