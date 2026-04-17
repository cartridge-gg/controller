import { useState } from "react";
import {
  Button,
  HeaderInner,
  CreditCardIcon,
  LayoutContent,
  LayoutFooter,
  Spinner,
} from "@cartridge/ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { CoinflowForm, type CoinflowFormHandle } from "./form";

export function CoinflowCheckout() {
  const [handle, setHandle] = useState<CoinflowFormHandle | null>(null);

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
