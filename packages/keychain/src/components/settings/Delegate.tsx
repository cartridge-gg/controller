import {
  LayoutContent,
  LayoutFooter,
  AlertIcon,
  Button,
  Input,
  HeaderInner,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { useCallback, useEffect, useState } from "react";
import { CallData, num } from "starknet";
import { createExecuteUrl } from "@/utils/connection/execute";
import { useNavigate } from "react-router-dom";

export function Delegate() {
  const { controller } = useConnection();
  const navigate = useNavigate();
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
    if (!controller) return;

    const transactions = [
      {
        contractAddress: controller.address(),
        entrypoint: "set_delegate_account",
        calldata: CallData.compile([delegateAddress]),
      },
    ];

    const url = createExecuteUrl(transactions);
    navigate(url, { replace: true });
  }, [controller, delegateAddress, navigate]);

  return (
    <>
      <HeaderInner variant="compressed" title="Delegate account" hideIcon />
      <LayoutContent>
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
    </>
  );
}
