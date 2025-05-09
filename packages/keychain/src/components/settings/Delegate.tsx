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

export function Delegate({ onBack }: { onBack: () => void }) {
  const { controller, context, setContext } = useConnection();
  const [delegateAddress, setDelegateAddress] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      CallData.compile([delegateAddress]);
      setIsValid(num.isHex(delegateAddress));
    } catch {
      setIsValid(false);
    }
  }, [delegateAddress]);

  const onSetDelegate = useCallback(() => {
    if (!context || !controller) return;
    setContext({
      transactions: [
        {
          contractAddress: controller.address(),
          entrypoint: "set_delegate_account",
          calldata: CallData.compile([delegateAddress]),
        },
      ],
      type: "execute",
      resolve: context.resolve,
      reject: context.reject,
    } as ExecuteCtx);
  }, [controller, delegateAddress, context, setContext]);

  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        title="Delegate account"
        onBack={() => onBack()}
        hideSettings
      />
      <LayoutContent className="gap-6">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-foreground-400 text-center">
            Your controller can be owned by an existing Starknet wallet which
            can receive the rewards you earn while playing. <br />
            (This can be updated later)
          </div>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="0x..."
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            {!isValid && delegateAddress !== "" && (
              <div className="flex items-center gap-2 text-destructive-100">
                <AlertIcon size="sm" />
                <div className="text-sm">Invalid address!</div>
              </div>
            )}
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button onClick={onSetDelegate} disabled={!isValid}>
          Set delegate account
        </Button>
        {/* <Button variant="secondary" onClick={onClose}>
          Setup later
        </Button> */}
      </LayoutFooter>
    </LayoutContainer>
  );
}
