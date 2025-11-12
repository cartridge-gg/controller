import { doSignup } from "@/hooks/account";
import Controller from "@/utils/controller";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  HeaderInner,
  LayoutContainer,
} from "@cartridge/ui";
import { Unsupported } from "./Unsupported";
import { FaceIDImage } from "./FaceID";
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
          if (!window.opener) {
            throw new Error("Window opener not found");
          }

          const controller = await Controller.fromStore();
          const ret = await controller?.createPasskeySigner(
            import.meta.env.VITE_RP_ID,
          );
          window.opener.postMessage(
            { target: "passkey-creation-popup", payload: ret },
            import.meta.env.VITE_ORIGIN,
          );
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
    <LayoutContainer>
      <HeaderInner
        variant="expanded"
        title={title}
        description={description}
        hideIcon
      />
      <LayoutContent className="items-center pb-10">
        <FaceIDImage />
      </LayoutContent>

      <LayoutFooter>
        <Button onClick={onAuth} isLoading={isLoading}>
          {cta}
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
