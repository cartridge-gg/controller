import {
  presets,
} from "@cartridge/controller";
import { ChakraProvider } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ControllerThemeProvider, useChakraTheme, useControllerThemeQuery } from "hooks/theme";

export function Provider({ children }: PropsWithChildren) {
  const query = useControllerThemeQuery();
  const preset = presets[query?.preset ?? ""] ?? presets.cartridge;
  const chakraTheme = useChakraTheme(query);

  const { colors, ...controllerTheme } = preset

  return (
    <ChakraProvider theme={chakraTheme}>
      <QueryClientProvider client={queryClient}>
        <ControllerThemeProvider value={controllerTheme}>
          {children}
        </ControllerThemeProvider>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});
