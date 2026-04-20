"use client";

import React, { useCallback } from "react";
import { toast as sonnerToast, ExternalToast } from "sonner";
import { ToastProps } from "./toast";
import { ErrorToast, SuccessToast } from "./specialized-toasts";

export type ToasterToast = ToastProps & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  element?: React.ReactElement;
  duration?: number;
  toasterId?: string;
  toastId?: string;
};

function useToast() {
  const customToast = useCallback((toast: ToasterToast) => {
    const sticky = toast.duration == 0;
    const options: ExternalToast = {
      duration: sticky ? 60000 : toast.duration,
    };
    if (toast.toasterId) options.toasterId = toast.toasterId;
    if (toast.element) options.id = toast.toastId;
    sonnerToast.custom(
      (id) =>
        toast.element ??
        (toast.variant == "destructive" ? (
          <ErrorToast
            message={toast.title ?? ""}
            toastId={(toast.toastId as string) ?? id}
          />
        ) : (
          <SuccessToast
            message={toast.title ?? ""}
            toastId={(toast.toastId as string) ?? id}
          />
        )),
      options,
    );
  }, []);
  return {
    toast: customToast,
  };
}

export { useToast };
