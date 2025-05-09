import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  AlertIcon,
  Button,
  Input,
  LayoutHeader,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { useCallback, useEffect, useState } from "react";
import { CallData, num } from "starknet";
import { ExecuteCtx } from "@/utils/connection";

export function Recovery({ onBack }: { onBack: () => void }) {
  const { controller, context, setContext } = useConnection();
  const [externalOwnerAddress, setExternalOwnerAddress] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      CallData.compile([externalOwnerAddress]);
      setIsValid(num.isHex(externalOwnerAddress));
    } catch {
      setIsValid(false);
    }
  }, [externalOwnerAddress]);

  const onSetRecovery = useCallback(() => {
    if (!context || !controller) return;
    setContext({
      transactions: [
        {
          contractAddress: controller.address(),
          entrypoint: "register_external_owner",
          calldata: CallData.compile([externalOwnerAddress]),
        },
      ],
      type: "execute",
      resolve: context.resolve,
      reject: context.reject,
    } as ExecuteCtx);
  }, [controller, externalOwnerAddress, context, setContext]);

  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        title="Recovery Account(s)"
        onBack={onBack}
        hideSettings
      />
      <LayoutContent>
        {/* TODO: Get rid of this div once Content is updated with TW */}
        <div className="flex flex-col gap-4">
          <div className="text-sm text-foreground-400 text-center">
            Your controller can be owned by an existing Starknet wallet
          </div>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="0x..."
              value={externalOwnerAddress}
              onChange={(e) => setExternalOwnerAddress(e.target.value)}
            />
            {!isValid && externalOwnerAddress !== "" && (
              <div className="flex items-center gap-2 text-destructive-100">
                <AlertIcon size="sm" />
                <div className="text-sm">Invalid address!</div>
              </div>
            )}
          </div>
        </div>
      </LayoutContent>

      <LayoutFooter>
        <Button onClick={onSetRecovery} disabled={!isValid}>
          Add Recovery Account
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
