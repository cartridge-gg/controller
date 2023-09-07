import {
  Box,
  IconButton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
  Link,
} from "@chakra-ui/react";
import { Summary, TransactionSummary } from "./TransactionSummary";
import {
  CodeSolidIcon,
  JoystickSolidIcon,
  LockIcon,
  WedgeUpIcon,
  WrenchSolidIcon,
} from "@cartridge/ui";
import { Policy } from "@cartridge/controller";
import { SessionDetails } from "./SessionDetails";
import React, { useMemo } from "react";

export function PortalFooter({
  children,
  origin,
  policies,
  isSignup,
  isSlot,
  showTerm = true,
}: React.PropsWithChildren & {
  origin?: string;
  policies?: Policy[];
  isSignup?: boolean;
  isSlot?: boolean;
  showTerm?: boolean;
}) {
  const { isOpen, onToggle } = useDisclosure();
  const isExpandable = useMemo(() => !!origin, [origin]);
  const hostname = useMemo(
    () => (origin ? new URL(origin).hostname : undefined),
    [origin],
  );

  return (
    <VStack
      w="full"
      align="flex-start"
      position={["fixed", "fixed", "absolute"]}
      bottom={0}
      left={0}
      bg="solid.bg"
      h="auto"
      minH={isOpen ? 478 : 0}
      transition="all 0.40s ease-out"
      p={4}
      pt={0}
    >
      {isExpandable && (
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
      )}

      <VStack
        pt={6}
        pb={isExpandable ? 4 : undefined}
        align="stretch"
        w="full"
        h="full"
        borderTopWidth={1}
        borderColor="solid.tertiary"
        overflowY={isOpen ? "scroll" : "hidden"}
        css={{
          "::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
        }}
      >
        <TransactionSummary
          isSignup={isSignup}
          isSlot={isSlot}
          showTerm={showTerm}
          hostname={hostname}
        />

        {isOpen && hostname && policies && (
          <SessionDetails hostname={hostname} policies={policies} />
        )}

        {/* TODO: starter pack
          starterData && remaining > 0 && (
          <>
            <HStack gap="10px">
              {starterData.game.starterPack.starterPackTokens.map(
                (data, key) => (
                  <ImageFrame
                    key={key}
                    bgImage={`url(${data.token.thumbnail.uri})`}
                  />
                ),
              )}
              <ImageFrame>
                <OlmechIcon boxSize="30px" />
              </ImageFrame>
            </HStack>
            <HStack align="flex-start">
              <SparklesSolidIcon />
              <Text fontSize="12px" color="whiteAlpha.600">
                Claim Starterpack
              </Text>
            </HStack>
          </>
                ) */}
      </VStack>

      <Spacer />

      <VStack align="strech" w="full">
        {children}
      </VStack>
    </VStack>
  );
}

export const PORTAL_FOOTER_MIN_HEIGHT = 212;
