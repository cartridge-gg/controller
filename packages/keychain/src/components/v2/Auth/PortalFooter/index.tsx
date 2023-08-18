import {
  Box,
  IconButton,
  Spacer,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { TransactionSummary } from "./TransactionSummary";
import { WedgeUpIcon } from "@cartridge/ui";
import { Policy } from "@cartridge/controller";
import { SessionDetails } from "./SessionDetails";

export function PortalFooter({
  children,
  origin,
  policies,
  isSignup,
}: {
  children?: React.ReactElement;
  origin?: string;
  policies?: Policy[];
  isSignup?: boolean;
}) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <VStack
      w="full"
      align="flex-start"
      position="fixed"
      bottom={0}
      left={0}
      bg="solid.bg"
      h="auto"
      minH={isOpen ? 478 : 0}
      transition="all 0.40s ease-out"
      p={4}
      paddingTop={0}
    >
      <Box // mimic top border
        w="50px"
        h="25px"
        bg="solid.accent"
        borderRadius="50px 50px 0 0"
        position="absolute"
        left="calc(50% - 50px / 2)"
        top="calc(-50px / 2)"
      >
        <IconButton
          left="1px"
          top="1px"
          aria-label="Expand footer"
          icon={
            <WedgeUpIcon
              boxSize={10}
              transform={isOpen ? "rotate(180deg)" : undefined}
              transition="all 0.40s ease-out"
              color="text.secondary"
            />
          }
          size="lg"
          variant="round"
          bg="solid.bg"
          onClick={onToggle}
        />
      </Box>

      <VStack
        paddingTop={6}
        paddingBottom={4}
        align="stretch"
        w="full"
        h="full"
        borderTopWidth={1}
        borderColor="solid.accent"
        overflowY={isOpen ? "scroll" : "hidden"}
        css={{
          "::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
        }}
      >
        {origin && <TransactionSummary origin={origin} isSignup={isSignup} />}

        {isOpen && origin && policies && (
          <SessionDetails origin={origin} policies={policies} />
        )}
      </VStack>

      <Spacer />

      <VStack align="strech" w="full">
        {children}
      </VStack>
    </VStack>
  );
}

export const PORTAL_FOOTER_MIN_HEIGHT = 212;
