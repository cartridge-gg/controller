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

export function Recovery() {
  const { controller } = useConnection();
  const navigate = useNavigate();
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
    if (!controller) return;

    const transactions = [
      {
        contractAddress: controller.address(),
        entrypoint: "register_external_owner",
        calldata: CallData.compile([externalOwnerAddress]),
      },
    ];

    const url = createExecuteUrl(transactions);
    navigate(url, { replace: true });
  }, [controller, externalOwnerAddress, navigate]);

  return (
    <>
      <HeaderInner variant="compressed" title="Add Recovery Account" hideIcon />
      <LayoutContent>
        {/* TODO: Get rid of this div once Content is updated with TW */}
        <div className="flex flex-col gap-4">
          <div className="text-sm text-foreground-400">
            Recovery accounts are Starknet wallets that can be used to recover
            your Controller if you lose access to your signers.
          </div>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Wallet Address"
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
    </>
  );
}
