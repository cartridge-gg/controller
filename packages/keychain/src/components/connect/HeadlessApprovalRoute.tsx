import { HeaderInner } from "@cartridge/ui";
import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNavigation } from "@/context";
import { useConnection } from "@/hooks/connection";
import {
  completeHeadlessApprovalRequest,
  getHeadlessApprovalRequest,
  rejectHeadlessApprovalRequest,
  resolveHeadlessApprovalRequest,
} from "@/utils/connection/headless-requests";
import { CreateSession } from "./CreateSession";

export function HeadlessApprovalRoute() {
  const { requestId } = useParams<{ requestId: string }>();
  const { controller, policies, parent, closeModal, setOnModalClose } =
    useConnection();
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
    // Reuse the existing session-created callback used by standalone flows.
    // The parent controller will re-probe and update its connected account.
    await parent?.onSessionCreated?.();
    resolveHeadlessApprovalRequest(requestId);
    closeModal?.();
    navigate("/", { replace: true });
  }, [requestId, controller, parent, closeModal, navigate]);

  useEffect(() => {
    if (!setOnModalClose || !requestId) return;

    setOnModalClose(() => {
      // If the request still exists, the modal close is treated as a cancel.
      if (!getHeadlessApprovalRequest(requestId)) {
        return;
      }
      rejectHeadlessApprovalRequest(
        requestId,
        new Error("Headless session approval was canceled"),
      );
      completeHeadlessApprovalRequest(requestId);
    });

    return () => {
      setOnModalClose(() => {});
    };
  }, [setOnModalClose, requestId]);

  useEffect(() => {
    return () => {
      if (!requestId) return;
      // If the request still exists, the user navigated away or canceled.
      if (getHeadlessApprovalRequest(requestId)) {
        rejectHeadlessApprovalRequest(
          requestId,
          new Error("Headless session approval was canceled"),
        );
        completeHeadlessApprovalRequest(requestId);
      }
    };
  }, [requestId]);

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
