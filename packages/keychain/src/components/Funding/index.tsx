import { Container, Content, Footer } from "components/layout";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { useConnection } from "hooks/connection";
import { CopyAddress } from "../CopyAddress";
import { ArrowLineDownIcon, CreditsIcon, EthereumIcon } from "@cartridge/ui";
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
      title={title || `Fund ${controller.username()}`}
      description={<CopyAddress address={controller.address} />}
      Icon={ArrowLineDownIcon}
    >
      <Content gap={6}>
        <Balance showBalances={["credits", "eth"]} />
      </Content>
      <Footer>
        {showCredits && (
          <Button
            colorScheme="colorful"
            onClick={() => setState(FundingState.FUND_CREDITS)}
          >
            <CreditsIcon fontSize={20} mr="5px" /> Purchase Credits
          </Button>
        )}
        <Button onClick={() => setState(FundingState.FUND_ETH)}>
          <EthereumIcon fontSize={20} mr="5px" /> Deposit Eth
        </Button>
      </Footer>
    </Container>
  );
}
