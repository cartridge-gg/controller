import {
  ArgentColorIcon,
  DiscordColorIcon,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  WalletConnectColorIcon,
} from "@cartridge/ui-next";
import { AuthenticationMethod } from "../types";

export class AuthFactory {
  static create(mode: AuthenticationMethod) {
    switch (mode) {
      case "webauthn":
        return {
          variant: "primary" as const,
          icon: <PasskeyIcon />,
          mode,
          label: "Passkey",
        };
      case "metamask":
        return {
          variant: "secondary" as const,
          icon: <MetaMaskColorIcon />,
          mode,
          label: "MetaMask",
        };
      case "argent":
        return {
          variant: "secondary" as const,
          icon: <ArgentColorIcon />,
          mode,
          label: "Argent",
        };
      case "rabby":
        return {
          variant: "secondary" as const,
          icon: <RabbyColorIcon />,
          mode,
          label: "Rabby",
        };
      case "phantom":
        return {
          variant: "secondary" as const,
          icon: <PhantomColorIcon />,
          mode,
          label: "Phantom",
        };
      case "social":
        return {
          variant: "secondary" as const,
          icon: <DiscordColorIcon />,
          mode,
          label: "Discord",
        };
      case "walletconnect":
        return {
          variant: "secondary" as const,
          icon: <WalletConnectColorIcon />,
          mode,
          label: "Wallet Connect",
        };
      default:
        throw new Error(`Unknown authentication mode: ${mode}`);
    }
  }
}
