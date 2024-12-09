import { configs } from "./generated/controller-configs";
import { TypedData } from "@starknet-io/types-js";
import { metadata } from "./generated/erc20-metadata";

export const controllerConfigs = configs;
export const erc20Metadata = metadata;
export const defaultTheme = configs["cartridge"].theme!;

export type EkuboERC20Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: number;
  total_supply: number | null;
  logo_url?: string;
  hidden?: boolean;
  disabled?: boolean;
};

export type Policy = CallPolicy | TypedDataPolicy;

export type CallPolicy = {
  target: string;
  method: string;
  description?: string;
};

export type TypedDataPolicy = Omit<TypedData, "message">;

export type Policies = Policy[] | SessionPolicies;

export type SessionPolicies = {
  /** The key must be the contract address */
  contracts?: ContractPolicies;
  messages?: SignMessagePolicy[];
};

export type ContractPolicies = Record<string, ContractPolicy>;

export type ContractPolicy = {
  name?: string;
  description?: string;
  methods: Method[];
};

export type Method = {
  name?: string;
  description?: string;
  entrypoint: string;
};

export type SignMessagePolicy = TypedDataPolicy & {
  name?: string;
  description?: string;
};

export type ControllerConfig = {
  origin: string | string[];
  policies?: SessionPolicies;
  theme?: ControllerTheme;
};

export type ControllerConfigs = Record<string, ControllerConfig>;

export type ColorMode = "light" | "dark";

export type ControllerTheme = {
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colors?: ControllerColors;
};

export type ControllerColors = {
  primary?: ControllerColor;
  primaryForeground?: ControllerColor;
};

export type ControllerColor = ThemeValue<string>;

export type ThemeValue<T> = T | { dark: T; light: T };
