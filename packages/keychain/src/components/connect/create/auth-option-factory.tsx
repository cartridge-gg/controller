import {
  ArgentColorIcon,
  DiscordColorIcon,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
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
        };
      case "metamask":
        return {
          variant: "secondary" as const,
          icon: <MetaMaskColorIcon />,
          mode,
        };
      case "argent":
        return {
          variant: "secondary" as const,
          icon: <ArgentColorIcon />,
          mode,
        };
      case "rabby":
        return {
          variant: "secondary" as const,
          icon: <RabbyColorIcon />,
          mode,
        };
      case "phantom":
        return {
          variant: "secondary" as const,
          icon: <PhantomColorIcon />,
          mode,
        };
      case "social":
        return {
          variant: "secondary" as const,
          icon: <DiscordColorIcon />,
          mode,
        };
      default:
        throw new Error(`Unknown authentication mode: ${mode}`);
    }
  }
}
