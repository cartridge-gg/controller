import { addWebauthnSigner } from "@/components/settings/signers/add-signer/webauthn";
import { doSignup } from "@/hooks/account";
import Controller from "@/utils/controller";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  HeaderInner,
} from "@cartridge/ui";
import { Unsupported } from "./Unsupported";
import { doSignup } from "@/hooks/account";
import { useIsSupported } from "./useIsSupported";
import { FaceIDImage } from "./FaceID";
import { Unsupported } from "./Unsupported";
import { useIsSupported } from "./useIsSupported";
import { useCallback, useState } from "react";

export type AuthAction = "signup" | "login" | "add-signer";

export function Authenticate({
  name,
  network,
  action,
  onSuccess,
  appId,
}: {
  name: string;
  network: string;
  action: AuthAction;
  onSuccess: () => void;
  appId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSupported, message } = useIsSupported();

  const onAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      switch (action) {
        case "signup":
          await doSignup(decodeURIComponent(name), network);
          break;
        case "login":
          break;
        case "add-signer": {
          if (appId.length === 0) {
            throw new Error("App ID is required");
          }
          const controller = Controller.fromStore(appId);
          await addWebauthnSigner(controller);
          break;
        }
        default:
          throw new Error(`Unsupported action ${action}`);
      }

      onSuccess();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, action, name, network, appId]);

  if (!isSupported && message) {
    return <Unsupported message={message} />;
  }

  const title =
    action === "signup" || action === "add-signer"
      ? "Create Passkey"
      : "Hello from Cartridge!";
  const description =
    action === "signup" || action === "add-signer" ? (
      <>
        Your controller keys will be saved in
        <br /> your device&apos;s password manager
      </>
    ) : (
      <>Please click continue.</>
    );
  const cta =
    action === "signup" || action === "add-signer"
      ? "Create Passkey"
      : "continue";

  return (
    <>
      <HeaderInner variant="expanded" title={title} description={description} />
      <LayoutContent className="items-center pb-10">
        <FaceIDImage />
      </LayoutContent>

      <LayoutFooter>
        <Button onClick={onAuth} isLoading={isLoading}>
          {cta}
        </Button>
      </LayoutFooter>
    </>
  );
}
