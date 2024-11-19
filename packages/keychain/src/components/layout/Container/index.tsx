import {
  Container as ChakraContainer,
  VStack,
  StyleProps,
  Flex,
  Show,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Header, HeaderProps } from "./Header";

export function Container({
  children,
  onBack,
  hideAccount,
  Icon,
  icon,
  title,
  description,
  variant,
}: {
  variant?: LayoutVariant;
} & PropsWithChildren &
  StyleProps &
  HeaderProps) {
  return (
    <Wrapper variant={variant}>
      <Header
        onBack={onBack}
        hideAccount={hideAccount}
        Icon={Icon}
        icon={icon}
        title={title}
        description={description}
      />

      <VStack w="full">{children}</VStack>
    </Wrapper>
  );
}

export const FOOTER_HEIGHT = 40;
export const PORTAL_WINDOW_HEIGHT = 600;

function Wrapper({
  variant = "compressed",
  children,
  ...rest
}: React.PropsWithChildren & { variant?: LayoutVariant }) {
  const [height, setHeight] = useState(0);
  const { isOpen, onToggle } = useDisclosure();

  return (
    <LayoutContext.Provider
      value={{ variant, footer: { height, setHeight, isOpen, onToggle } }}
    >
      {/** Show as full page  */}
      <Show below="md">
        <ChakraContainer
          w="100vw"
          bg="solid.bg"
          p={0}
          as={motion.div}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          centerContent
          position="relative"
          {...rest}
        >
          {children}
        </ChakraContainer>
      </Show>

      {/** Show as modal  */}
      <Show above="md">
        <Flex w="100vw" h="100vh" p={0} align="center">
          <ChakraContainer
            w="432px"
            h={`${PORTAL_WINDOW_HEIGHT}px`}
            borderWidth={1}
            borderColor="solid.primaryAccent"
            verticalAlign="middle"
            bg="solid.bg"
            p={0}
            as={motion.div}
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            centerContent
            borderRadius="lg"
            overflow="hidden"
            position="relative"
            {...rest}
          >
            {children}
          </ChakraContainer>
        </Flex>
      </Show>
    </LayoutContext.Provider>
  );
}

const LayoutContext = createContext<LayoutContextValue>({
  variant: "expanded",
  footer: {
    height: 0,
    setHeight: () => {},
    isOpen: false,
    onToggle: () => {},
  },
});

type LayoutContextValue = {
  variant: LayoutVariant;
  footer: {
    height: number;
    setHeight: (height: number) => void;
    isOpen: boolean;
    onToggle: () => void;
  };
};

export type LayoutVariant = "expanded" | "compressed";

export function useLayout() {
  return useContext(LayoutContext);
}

export function useLayoutVariant(): LayoutVariant {
  return useLayout().variant;
}
