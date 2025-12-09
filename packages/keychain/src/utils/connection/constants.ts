import { AuthOption } from "@cartridge/controller";

export const AUTH_METHODS_LABELS: Record<AuthOption, string> = {
  argent: "Argent",
  braavos: "Braavos",
  webauthn: "Passkey",
  phantom: "Phantom",
  "phantom-evm": "Phantom",
  rabby: "Rabby",
  metamask: "MetaMask",
  discord: "Discord",
  walletconnect: "Wallet Connect",
  google: "Google",
  base: "Base Wallet",
  password: "Password",
};
