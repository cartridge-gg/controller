const HEADLESS_REQUEST_TTL_MS = 5 * 60 * 1000;

export type HeadlessApprovalRequest = {
  id: string;
  createdAt: number;
  expiresAt: number;
};

const pendingRequests = new Map<string, HeadlessApprovalRequest>();
const pendingWaiters = new Map<
  string,
  {
    promise: Promise<void>;
    resolve: () => void;
    reject: (error: Error) => void;
    timeoutId?: ReturnType<typeof setTimeout>;
  }
>();

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

export const waitForHeadlessApprovalRequest = (id: string): Promise<void> => {
  const existing = pendingWaiters.get(id);
  if (existing) {
    return existing.promise;
  }

  const request = getHeadlessApprovalRequest(id);
  if (!request) {
    return Promise.reject(new Error("Headless approval expired"));
  }

  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const waiter: {
    promise: Promise<void>;
    resolve: () => void;
    reject: (error: Error) => void;
    timeoutId?: ReturnType<typeof setTimeout>;
  } = { promise, resolve, reject };
  pendingWaiters.set(id, waiter);

  const msUntilExpiry = Math.max(0, request.expiresAt - Date.now());
  const timeoutId = setTimeout(() => {
    if (!pendingWaiters.has(id)) return;
    pendingWaiters.get(id)?.reject(new Error("Headless approval expired"));
    pendingWaiters.delete(id);
  }, msUntilExpiry);

  // Store the timeout id after creation (for clearTimeout on resolve/reject).
  waiter.timeoutId = timeoutId;

  return promise;
};

export const resolveHeadlessApprovalRequest = (id: string) => {
  const waiter = pendingWaiters.get(id);
  if (!waiter) return;
  if (waiter.timeoutId) {
    clearTimeout(waiter.timeoutId);
  }
  waiter.resolve();
  pendingWaiters.delete(id);
};

export const rejectHeadlessApprovalRequest = (id: string, error: Error) => {
  const waiter = pendingWaiters.get(id);
  if (!waiter) return;
  if (waiter.timeoutId) {
    clearTimeout(waiter.timeoutId);
  }
  waiter.reject(error);
  pendingWaiters.delete(id);
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
