import { HeaderInner } from "@cartridge/ui";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
import {
  completeHeadlessApprovalRequest,
  getHeadlessApprovalRequest,
} from "@/utils/connection/headless-requests";
import { CreateSession } from "./CreateSession";

export function HeadlessApprovalRoute() {
  const { requestId } = useParams<{ requestId: string }>();
  const { controller, policies, parent } = useConnection();
  const { navigate } = useNavigation();

  const request = useMemo(() => {
    if (!requestId) {
      return undefined;
    }
    return getHeadlessApprovalRequest(requestId);
  }, [requestId]);

  const handleComplete = useCallback(async () => {
    if (!requestId || !controller) {
      return;
    }

    completeHeadlessApprovalRequest(requestId);
    await parent?.onHeadlessSessionApproved?.(requestId, controller.address());
    navigate("/", { replace: true });
  }, [requestId, controller, parent, navigate]);

  if (!requestId || !request) {
    return (
      <HeaderInner
        title="Headless approval expired"
        description="Please retry the headless login to continue."
      />
    );
  }

  if (!controller || !policies) {
    return (
      <HeaderInner
        title="Preparing session approval"
        description="Waiting for authentication to complete."
      />
    );
  }

  return (
    <CreateSession
      policies={policies}
      onConnect={handleComplete}
      onSkip={handleComplete}
    />
  );
}
