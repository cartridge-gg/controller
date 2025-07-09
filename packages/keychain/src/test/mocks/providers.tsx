import { ReactNode } from "react";
import { render, RenderResult } from "@testing-library/react";

import {
  ConnectionContextValue,
  VerifiableControllerTheme,
} from "@/components/provider/connection";
import { withConnection } from "./connection";
import { withPostHog } from "./posthog";
import { withStarknet } from "./starknet";
import { FeatureProvider } from "@/hooks/features";
import { NavigationProvider } from "@/context/navigation";

type ProvidersConfig = {
  connection?: Partial<ConnectionContextValue>;
  theme?: VerifiableControllerTheme;
  starknet?: {
    defaultChainId: bigint;
    nodeUrl: string;
  };
};

export function renderWithProviders(
  ui: ReactNode,
  config: ProvidersConfig = {},
): RenderResult {
  const wrapped = withConnection(
    <NavigationProvider>
      <FeatureProvider>
        {withStarknet(withPostHog(ui), config.starknet)}
      </FeatureProvider>
    </NavigationProvider>,
    config.connection,
  );

  return render(wrapped);
}
