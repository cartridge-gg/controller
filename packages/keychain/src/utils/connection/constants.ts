import { AuthenticationMethod } from "@/components/connect/types";

export const AUTH_METHODS_LABELS: Record<AuthenticationMethod, string> = {
  argent: "Argent",
  webauthn: "Passkey",
  phantom: "Phantom",
  rabby: "Rabby",
  metamask: "MetaMask",
  discord: "Discord",
  walletconnect: "Wallet Connect",
};
