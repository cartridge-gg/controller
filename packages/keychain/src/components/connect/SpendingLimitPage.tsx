import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { TokenConsent } from "./token-consent";
import { SpendingLimitCard } from "./SpendingLimitCard";
import { type ParsedSessionPolicies } from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";

export function SpendingLimitPage({
  policies,
  isConnecting,
  error,
  onBack,
  onConnect,
}: {
  policies: ParsedSessionPolicies;
  isConnecting: boolean;
  error?: ControllerError | Error;
  onBack: () => void;
  onConnect: () => void;
}) {
  const { theme } = useConnection();

  return (
    <>
      <HeaderInner
        className="pb-0"
        title={
          theme?.name?.toLowerCase() !== "cartridge"
            ? `Connect to ${theme?.name}`
            : "Connect Controller"
        }
      />
      <LayoutContent className="pb-0">
        <div className="flex flex-col gap-4">
          <TokenConsent />
          <SpendingLimitCard policies={policies} />
        </div>
      </LayoutContent>
      <LayoutFooter className="pt-4">
        {error && <ControllerErrorAlert className="mb-3" error={error} />}

        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={isConnecting}
            isLoading={isConnecting}
            onClick={onConnect}
          >
            Confirm
          </Button>
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isConnecting}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
}
