import {
  ArgentColorIcon,
  DiscordColorIcon,
  IconProps,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  WalletConnectColorIcon,
} from "@cartridge/ui-next";
import React from "react";
import { AuthenticationMethod } from "../types";

type AuthConfig = {
  variant: "primary" | "secondary";
  IconComponent: React.ComponentType<IconProps>;
  label: string;
};

const AUTH_CONFIG: Partial<Record<AuthenticationMethod, AuthConfig>> = {
  webauthn: {
    variant: "primary",
    IconComponent: PasskeyIcon,
    label: "Passkey",
  },
  metamask: {
    variant: "secondary",
    IconComponent: MetaMaskColorIcon,
    label: "MetaMask",
  },
  argent: {
    variant: "secondary",
    IconComponent: ArgentColorIcon,
    label: "Argent",
  },
  rabby: {
    variant: "secondary",
    IconComponent: RabbyColorIcon,
    label: "Rabby",
  },
  phantom: {
    variant: "secondary",
    IconComponent: PhantomColorIcon,
    label: "Phantom",
  },
  social: {
    variant: "secondary",
    IconComponent: DiscordColorIcon,
    label: "Discord",
  },
  walletconnect: {
    variant: "secondary",
    IconComponent: WalletConnectColorIcon,
    label: "Wallet Connect",
  },
};

export class AuthFactory {
  static create(mode: AuthenticationMethod) {
    const config = AUTH_CONFIG[mode];

    if (!config) {
      throw new Error(`Unknown authentication mode: ${mode}`);
    }

    const { IconComponent } = config;

    return {
      icon: <IconComponent size="sm" />,
      mode,
      ...config,
    };
  }
}
