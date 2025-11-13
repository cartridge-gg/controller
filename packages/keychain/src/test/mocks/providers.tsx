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
import { NavigationProvider } from "@/context/navigation";
import { QueryClient, QueryClientProvider } from "react-query";

type ProvidersConfig = {
  connection?: Partial<ConnectionContextValue>;
  theme?: VerifiableControllerTheme;
  starknet?: {
    defaultChainId: bigint;
    nodeUrl: string;
  };
  initialUrl?: string;
};

const queryClient = new QueryClient();

export function renderWithProviders(
  ui: ReactNode,
  config: ProvidersConfig = {},
): RenderResult {
  // If initialUrl is provided, update window.location BEFORE rendering
  if (config.initialUrl) {
    window.history.pushState({}, "", config.initialUrl);
  }

  const RouterComponent = (
    <BrowserRouter>
      <NavigationProvider>
        <FeatureProvider>
          <QueryClientProvider client={queryClient}>
            {withStarknet(withPostHog(ui), config.starknet)}
          </QueryClientProvider>
        </FeatureProvider>
      </NavigationProvider>
    </BrowserRouter>
  );

  const wrapped = withConnection(RouterComponent, config.connection);

  return render(wrapped);
}
