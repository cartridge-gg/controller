import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { DeployCtx } from "@/utils/connection/types";
import { ResponseCodes } from "@cartridge/controller";
import { DeployController } from "./DeployController";
import { useEffect } from "react";

export function DeployControllerRoute() {
  const { context } = useConnection();
  const { navigate } = useNavigation();

  useEffect(() => {
    // If no deploy context is available, navigate back to home
    if (!context || context.type !== "deploy") {
      navigate("/", { replace: true });
    }
  }, [context, navigate]);

  if (!context || context.type !== "deploy") {
    return null;
  }

  const deployContext = context as DeployCtx;

  const handleClose = () => {
    deployContext.resolve({
      code: ResponseCodes.CANCELED,
      message: "Canceled",
    });
    navigate("/", { replace: true });
  };

  return <DeployController onClose={handleClose} />;
}
