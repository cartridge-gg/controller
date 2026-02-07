const HEADLESS_REQUEST_TTL_MS = 5 * 60 * 1000;

export type HeadlessApprovalRequest = {
  id: string;
  createdAt: number;
  expiresAt: number;
};

const pendingRequests = new Map<string, HeadlessApprovalRequest>();

const generateRequestId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `headless_${Math.random().toString(36).slice(2)}_${Date.now()}`;
};

export const createHeadlessApprovalRequest = (): HeadlessApprovalRequest => {
  const id = generateRequestId();
  const createdAt = Date.now();
  const request: HeadlessApprovalRequest = {
    id,
    createdAt,
    expiresAt: createdAt + HEADLESS_REQUEST_TTL_MS,
  };

  pendingRequests.set(id, request);
  return request;
};

export const getHeadlessApprovalRequest = (id: string) => {
  const request = pendingRequests.get(id);
  if (!request) {
    return undefined;
  }

  if (Date.now() > request.expiresAt) {
    pendingRequests.delete(id);
    return undefined;
  }

  return request;
};

export const completeHeadlessApprovalRequest = (id: string) => {
  pendingRequests.delete(id);
};

const cleanupExpiredRequests = () => {
  for (const [id, request] of pendingRequests.entries()) {
    if (Date.now() > request.expiresAt) {
      pendingRequests.delete(id);
    }
  }
};

export const hasPendingHeadlessApproval = () => {
  cleanupExpiredRequests();
  return pendingRequests.size > 0;
};
