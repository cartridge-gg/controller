import { getPromiseWithResolvers } from "@/utils/promises";
import { cleanupCallbacks, getCallbacks, storeCallbacks } from "./callbacks";

const HEADLESS_REQUEST_TTL_MS = 5 * 60 * 1000;

export type HeadlessApprovalRequest = {
  id: string;
  createdAt: number;
  expiresAt: number;
};

const pendingRequests = new Map<string, HeadlessApprovalRequest>();

type HeadlessApprovalWaiter = {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
};

const HEADLESS_WAITER_KEY = "__cartridge_headless_waiter";

const generateRequestId = () => {
  const prefix = "headless_";
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}${crypto.randomUUID()}`;
  }

  return `${prefix}${Math.random().toString(36).slice(2)}_${Date.now()}`;
};

const getWaiter = (id: string): HeadlessApprovalWaiter | undefined => {
  const callbacks = getCallbacks(id) as Record<string, unknown> | undefined;
  return callbacks?.[HEADLESS_WAITER_KEY] as HeadlessApprovalWaiter | undefined;
};

const setWaiter = (id: string, waiter: HeadlessApprovalWaiter) => {
  storeCallbacks(id, {
    [HEADLESS_WAITER_KEY]: waiter,
  });
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
  const existing = getWaiter(id);
  if (existing) {
    return existing.promise;
  }

  const request = getHeadlessApprovalRequest(id);
  if (!request) {
    return Promise.reject(new Error("Headless approval expired"));
  }

  const { promise, resolve, reject } = getPromiseWithResolvers<void>();
  const waiter: HeadlessApprovalWaiter = { promise, resolve, reject };
  setWaiter(id, waiter);

  const msUntilExpiry = Math.max(0, request.expiresAt - Date.now());
  const timeoutId = setTimeout(() => {
    const pending = getWaiter(id);
    if (!pending) return;
    pending.reject(new Error("Headless approval expired"));
    cleanupCallbacks(id);
  }, msUntilExpiry);

  // Store the timeout id after creation (for clearTimeout on resolve/reject).
  waiter.timeoutId = timeoutId;

  return promise;
};

export const resolveHeadlessApprovalRequest = (id: string) => {
  const waiter = getWaiter(id);
  if (!waiter) return;
  if (waiter.timeoutId) {
    clearTimeout(waiter.timeoutId);
  }
  waiter.resolve();
  cleanupCallbacks(id);
};

export const rejectHeadlessApprovalRequest = (id: string, error: Error) => {
  const waiter = getWaiter(id);
  if (!waiter) return;
  if (waiter.timeoutId) {
    clearTimeout(waiter.timeoutId);
  }
  waiter.reject(error);
  cleanupCallbacks(id);
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
