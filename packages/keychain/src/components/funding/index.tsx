import { Container, Content, Footer } from "@/components/layout";
import { useState } from "react";
import { useConnection } from "@/hooks/connection";
import {
  Button,
  ArrowIcon,
  CoinsIcon,
  EthereumIcon,
  CopyAddress,
} from "@cartridge/ui-next";
import { DepositEth } from "./DepositEth";
import { PurchaseCredits } from "./PurchaseCredits";
import { Balance } from "./Balance";

const enum FundingState {
  SHOW_OPTIONS,
  FUND_CREDITS,
  FUND_ETH,
}

export type FundingProps = {
  title?: React.ReactElement;
  onComplete?: (deployHash?: string) => void;
};

export function Funding({ onComplete, title }: FundingProps) {
  const { controller } = useConnection();
  const [state, setState] = useState<FundingState>(FundingState.SHOW_OPTIONS);
  const showCredits =
    typeof document !== "undefined" && document.cookie.includes("credits=");

  if (state === FundingState.FUND_ETH) {
    return (
      <DepositEth
        onComplete={onComplete}
        onBack={() => setState(FundingState.SHOW_OPTIONS)}
      />
    );
  }

  if (state === FundingState.FUND_CREDITS) {
    return (
      <PurchaseCredits onBack={() => setState(FundingState.SHOW_OPTIONS)} />
    );
  }

  return (
    <Container
      title={title || (controller ? `Fund ${controller.username()}` : "")}
      description={controller && <CopyAddress address={controller.address} />}
      icon={<ArrowIcon variant="down" />}
    >
      <Content className="gap-6">
        <Balance showBalances={["credits", "eth"]} />
      </Content>
      <Footer>
        {showCredits && (
          <Button onClick={() => setState(FundingState.FUND_CREDITS)}>
            <CoinsIcon variant="line" size="sm" /> Purchase Credits
          </Button>
        )}
        <Button
          onClick={() => setState(FundingState.FUND_ETH)}
          variant="secondary"
        >
          <EthereumIcon size="sm" className="mr-1" /> Deposit Eth
        </Button>
      </Footer>
    </Container>
  );
}
