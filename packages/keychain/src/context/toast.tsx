import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast, ToastOptions } from "@cartridge/controller";
import { useSonner } from "sonner";

interface ToastContextType {
  addToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [lastToastId, setLastToastId] = useState(0);
  const { toasts } = useSonner();
  useEffect(() => {
    toasts.forEach((toast) => {
      if (typeof toast.id === "number" && toast.id > lastToastId) {
        window.parent?.postMessage({ toast }, "*");
        setLastToastId(toast.id);
      }
    });
  }, [toasts, lastToastId]);

  const addToast = useCallback((options: ToastOptions) => {
    if (!toast) return;
    toast(options);
  }, []);

  const value: ToastContextType = {
    addToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
