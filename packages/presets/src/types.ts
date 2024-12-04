export type ThemeValue<T> = T | { dark: T; light: T };

export type ControllerColor = ThemeValue<string>;

export type ControllerColors = {
  primary?: ControllerColor;
  primaryForeground?: ControllerColor;
};

export type ControllerTheme = {
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colors?: ControllerColors;
};

export type Method = {
  name: string;
  description?: string;
};

export type ContractPolicy = {
  methods: Method | Method[];
};

export type ContractPolicies = Record<string, ContractPolicy>;

export type SessionPolicies = {
  contracts?: ContractPolicies;
  messages?: any[]; // Keeping this generic for now
};

export type ControllerConfig = {
  origin: string | string[];
  policies?: SessionPolicies;
  theme?: ControllerTheme;
};

export type ControllerConfigs = Record<string, ControllerConfig>;
