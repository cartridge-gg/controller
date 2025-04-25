import { ReactNode } from "react";
import { render, RenderResult } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  ConnectionContextValue,
  VerifiableControllerTheme,
} from "@/components/provider/connection";
import { withConnection } from "./connection";
import { withPostHog } from "./posthog";
import { withStarknet } from "./starknet";
import { FeatureProvider } from "@/hooks/features";

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
    <BrowserRouter>
      <FeatureProvider>
        {withStarknet(withPostHog(ui), config.starknet)}
      </FeatureProvider>
    </BrowserRouter>,
    config.connection,
  );

  return render(wrapped);
}
