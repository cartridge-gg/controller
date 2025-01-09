import { AlertIcon, Button, Input } from "@cartridge/ui-next";
import { Container, Content, Footer } from "@/components/layout";
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
      origin: context.origin,
      transactions: [
        {
          contractAddress: controller.address,
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
    <Container variant="expanded" title="Recovery Account(s)" onBack={onBack}>
      <Content>
        {/* TODO: Get rid of this div once Content is updated with TW */}
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center">
            Your controller can be owned by an existing Starknet wallet
          </div>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="0x..."
              value={externalOwnerAddress}
              onChange={(e) => setExternalOwnerAddress(e.target.value)}
            />
            {!isValid && externalOwnerAddress !== "" && (
              <div className="flex items-center gap-2 text-error-icon">
                <AlertIcon size="sm" />
                <div className="text-sm">Invalid address!</div>
              </div>
            )}
          </div>
        </div>
      </Content>

      <Footer>
        <Button onClick={onSetRecovery} disabled={!isValid}>
          Add Recovery Account
        </Button>
      </Footer>
    </Container>
  );
}