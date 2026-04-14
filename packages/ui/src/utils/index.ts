import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./account";
export * from "./api";
export * from "./color";
export * from "./context";
export * from "./date";
export * from "./erc20";
export * from "./explorer";
export * from "./hooks";
export * from "./iframe";
export * from "./network";
export * from "./number";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
