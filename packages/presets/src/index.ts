import { configs } from "./generated/controller-configs";
import { TypedData } from "@starknet-io/types-js";

export const controllerConfigs = configs;
export const defaultTheme = configs["cartridge"].theme!;

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
  methods: Method[];
  description?: string;
};

export type Method = {
  name?: string;
  entrypoint: string;
  description?: string;
};

export type SignMessagePolicy = TypedDataPolicy & {
  name: string;
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
