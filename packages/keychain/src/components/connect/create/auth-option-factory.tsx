import {
  ArgentColorIcon,
  DiscordColorIcon,
  IconProps,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
} from "@cartridge/ui-next";
import React from "react";
import { AuthenticationMethod } from "../types";

type AuthConfig = {
  variant: "primary" | "secondary";
  IconComponent: React.ComponentType<IconProps>;
};

const AUTH_CONFIG: Partial<Record<AuthenticationMethod, AuthConfig>> = {
  webauthn: { variant: "primary", IconComponent: PasskeyIcon },
  metamask: { variant: "secondary", IconComponent: MetaMaskColorIcon },
  argent: { variant: "secondary", IconComponent: ArgentColorIcon },
  rabby: { variant: "secondary", IconComponent: RabbyColorIcon },
  phantom: { variant: "secondary", IconComponent: PhantomColorIcon },
  social: { variant: "secondary", IconComponent: DiscordColorIcon },
};

export class AuthFactory {
  static create(mode: AuthenticationMethod) {
    const config = AUTH_CONFIG[mode];

    if (!config) {
      throw new Error(`Unknown authentication mode: ${mode}`);
    }

    const { variant, IconComponent } = config;

    return {
      variant,
      icon: <IconComponent size="sm" />,
      mode,
    };
  }
}
