import { AuthOption } from "@cartridge/controller";

export const AUTH_METHODS_LABELS: Record<AuthOption, string> = {
  argent: "Argent",
  webauthn: "Passkey",
  phantom: "Phantom",
  rabby: "Rabby",
  metamask: "MetaMask",
  discord: "Discord",
  walletconnect: "Wallet Connect",
};
