import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { SignMessageCtx } from "@/utils/connection/types";
import { ResponseCodes } from "@cartridge/controller";
import { SignMessage } from "./SignMessage";
import { useEffect } from "react";
import { Signature } from "starknet";

export function SignMessageRoute() {
  const { context } = useConnection();
  const { navigate } = useNavigation();

  useEffect(() => {
    // If no sign-message context is available, navigate back to home
    if (!context || context.type !== "sign-message") {
      navigate("/", { replace: true });
    }
  }, [context, navigate]);

  if (!context || context.type !== "sign-message") {
    return null;
  }

  const signContext = context as SignMessageCtx;

  const handleSign = (sig: Signature) => {
    signContext.resolve(sig);
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    signContext.resolve({
      code: ResponseCodes.CANCELED,
      message: "Canceled",
    });
    navigate("/", { replace: true });
  };

  return (
    <SignMessage
      typedData={signContext.typedData}
      onSign={handleSign}
      onCancel={handleCancel}
    />
  );
}