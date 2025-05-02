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
  Icon: React.ComponentType<IconProps>;
  label: string;
};

const AUTH_CONFIG: Partial<Record<AuthenticationMethod, AuthConfig>> = {
  webauthn: {
    variant: "primary",
    Icon: PasskeyIcon,
    label: "Passkey",
  },
  metamask: {
    variant: "secondary",
    Icon: MetaMaskColorIcon,
    label: "MetaMask",
  },
  argent: {
    variant: "secondary",
    Icon: ArgentColorIcon,
    label: "Argent",
  },
  rabby: {
    variant: "secondary",
    Icon: RabbyColorIcon,
    label: "Rabby",
  },
  phantom: {
    variant: "secondary",
    Icon: PhantomColorIcon,
    label: "Phantom",
  },
  social: {
    variant: "secondary",
    Icon: DiscordColorIcon,
    label: "Discord",
  },
  walletconnect: {
    variant: "secondary",
    Icon: WalletConnectColorIcon,
    label: "Wallet Connect",
  },
};

export class AuthFactory {
  static create(mode: AuthenticationMethod) {
    const config = AUTH_CONFIG[mode];

    if (!config) {
      throw new Error(`Unknown authentication mode: ${mode}`);
    }

    const { Icon, ...rest } = config;

    return {
      icon: <Icon size="sm" />,
      mode,
      ...rest,
    };
  }
}
