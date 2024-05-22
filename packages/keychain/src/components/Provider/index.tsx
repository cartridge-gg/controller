import { ChakraProvider } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ControllerThemeProvider, useChakraTheme, useControllerThemePreset } from "hooks/theme";

export function Provider({ children }: PropsWithChildren) {
  const preset = useControllerThemePreset();
  const chakraTheme = useChakraTheme(preset);

  const controllerTheme = useMemo(
    () =>
      preset
        ? {
          id: preset.id,
          name: preset.name,
          icon: preset.icon,
          cover: preset.cover,
        }
        : undefined,
    [preset],
  );

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
