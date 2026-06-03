import { useState } from "react";
import {
  Button,
  HeaderInner,
  CreditCardIcon,
  LayoutContent,
  LayoutFooter,
  Spinner,
} from "@cartridge/controller-ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { CoinflowForm, type CoinflowFormHandle } from "./form";
import { useIdentityContext } from "@/components/identity/provider";
import { AgeGate } from "@/components/identity/AgeGate";

export function CoinflowCheckout() {
  const [handle, setHandle] = useState<CoinflowFormHandle | null>(null);

  const {
    ageGateStatus: { isAllowed },
  } = useIdentityContext();
  if (!isAllowed) {
    return <AgeGate />;
  }

  return (
    <>
      <HeaderInner
        title="Enter Payment Details"
        icon={<CreditCardIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        <CoinflowForm onStateChange={setHandle} />
      </LayoutContent>
      <LayoutFooter>
        {handle?.error && <ControllerErrorAlert error={handle.error} />}
        <Button
          onClick={() => handle?.submit()}
          disabled={!handle?.isFormValid}
        >
          {handle?.isSubmitting ? <Spinner /> : "Pay"}
        </Button>
      </LayoutFooter>
    </>
  );
}
