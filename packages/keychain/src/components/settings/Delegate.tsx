import { AlertIcon, Button, Input } from "@cartridge/ui-next";
import { Container, Content, Footer } from "@/components/layout";
import { useConnection } from "@/hooks/connection";
import { useCallback, useEffect, useState } from "react";
import { CallData, num } from "starknet";
import { ExecuteCtx } from "@/utils/connection";
import { useController } from "@/hooks/controller";

export function Delegate({ onBack }: { onBack: () => void }) {
  const { context, setContext } = useConnection();
  const { controller } = useController();
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
      origin: context.origin,
      transactions: [
        {
          contractAddress: controller.address,
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
    <Container
      variant="expanded"
      title="Delegate account"
      onBack={() => onBack()}
    >
      <Content>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center">
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
              <div className="flex items-center gap-2 text-destructive-foreground">
                <AlertIcon size="sm" />
                <div className="text-sm">Invalid address!</div>
              </div>
            )}
          </div>
        </div>
      </Content>
      <Footer>
        <Button onClick={onSetDelegate} disabled={!isValid}>
          Set delegate account
        </Button>
        {/* <Button variant="secondary" onClick={onClose}>
          Setup later
        </Button> */}
      </Footer>
    </Container>
  );
}
