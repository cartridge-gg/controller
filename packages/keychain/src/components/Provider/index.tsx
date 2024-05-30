import { ChakraProvider, ColorMode } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  ControllerThemeProvider,
  useChakraTheme,
  useControllerThemePreset,
} from "hooks/theme";
import { useRouter } from "next/router";

export function Provider({ children }: PropsWithChildren) {
  const preset = useControllerThemePreset();
  const chakraTheme = useChakraTheme(preset);
  const router = useRouter();

  const controllerTheme = useMemo(
    () => ({
      id: preset.id,
      name: preset.name,
      icon: preset.icon,
      cover: preset.cover,
      colorMode: (router.query.colorMode as ColorMode) ?? "dark",
    }),
    [preset, router.query],
  );

  return (
    <ChakraProvider theme={chakraTheme}>
      <QueryClientProvider client={queryClient}>
        <ControllerThemeProvider value={controllerTheme}>
          {children}
        </ControllerThemeProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});
