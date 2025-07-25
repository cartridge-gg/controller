import { useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  CoinsIcon,
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
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const balances: BalanceType[] = isSlot
    ? [BalanceType.CREDITS]
    : [BalanceType.CREDITS, BalanceType.FEE_TOKEN];

  const handleNavigate = (path: string) => {
    // Preserve returnTo parameter when navigating
    const url = returnTo
      ? `${path}?returnTo=${encodeURIComponent(returnTo)}`
      : path;
    navigate(url);
  };

  return (
    <>
      <HeaderInner
        className="p-6"
        title={
          typeof title === "string"
            ? title
            : controller
              ? `Fund ${controller.username()}`
              : ""
        }
        icon={<ControllerIcon size="lg" />}
        hideIcon
      />
      <LayoutContent className="gap-6 px-6">
        <Balance types={balances} />
      </LayoutContent>
      <LayoutFooter>
        <Button onClick={() => handleNavigate("/funding/credits")}>
          <CoinsIcon variant="line" size="sm" /> Purchase Credits
        </Button>
        {!isSlot && (
          <Button
            onClick={() => handleNavigate("/funding/deposit")}
            variant="secondary"
          >
            Deposit
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}
