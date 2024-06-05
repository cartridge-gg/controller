import {
  HStack,
  IconButton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { CartridgeLogo, WedgeUpIcon } from "@cartridge/ui";
import { Policy } from "@cartridge/controller";
import React, { useMemo } from "react";
import { TOP_OFFSET, FOOTER_HEIGHT } from "components/layout";
import { motion } from "framer-motion";
import { SessionDetails } from "./SessionDetails";
import { TransactionSummary } from "./TransactionSummary";

export function Footer({
  children,
  origin,
  policies,
  isSlot,
  showTerm = false,
  showLogo = false
}: React.PropsWithChildren & {
  origin?: string;
  policies?: Policy[];
  isSlot?: boolean;
  showTerm?: boolean;
  showLogo?: boolean;
}) {
  const { isOpen, onToggle } = useDisclosure();
  const isExpandable = useMemo(() => !!origin, [origin]);
  const hostname = useMemo(
    () => (origin ? new URL(origin).hostname : undefined),
    [origin],
  );

  const height = useMemo(
    () =>
      isOpen ? `${window.innerHeight - TOP_OFFSET - FOOTER_HEIGHT}px` : "auto",
    [isOpen],
  );

  return (
    <VStack
      position={["fixed", "fixed", "absolute"]}
      bottom={0}
      w="full"
      zIndex="999999"
    >
      <VStack
        w="full"
        align="flex-start"
        bg="solid.bg"
        p={4}
        pt={0}
        borderTopWidth={1}
        borderColor="solid.spacer"
        as={motion.div}
        layout="position"
        animate={{ height, transition: { bounce: 0 } }}
      >
        <VStack
          pt={6}
          align="stretch"
          w="full"
          h="full"
          overflowY={isOpen ? "auto" : "hidden"}
          css={{
            "::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none",
          }}
        >
          <HStack align="flex-start">
            <TransactionSummary
              isSlot={isSlot}
              showTerm={showTerm}
              hostname={hostname}
            />

            <Spacer />

            {isExpandable && (
              <IconButton
                aria-label="Expand footer"
                icon={
                  <WedgeUpIcon
                    boxSize={8}
                    color="text.secondary"
                    transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                  />
                }
                size="sm"
                h={8}
                bg="solid.primary"
                zIndex="999999"
                onClick={onToggle}
              />
            )}
          </HStack>

          {isOpen && policies && (
            <SessionDetails policies={policies} isOpen={isOpen} />
          )}
        </VStack>

        <Spacer />

        <VStack align="strech" w="full">
          {children}
        </VStack>
      </VStack>

      {showLogo && (
        <HStack
          w="full"
          borderTopWidth={1}
          borderColor="solid.tertiary"
          color="text.secondary"
          alignItems="center"
          justify="center"
          h={FOOTER_HEIGHT / 4}
          gap={1}
        >
          <Text fontSize="xs" color="currentColor">
            Controller by
          </Text>

          <CartridgeLogo fontSize={100} color="text.secondary" />
        </HStack>
      )}
    </VStack>
  );
}

export const FOOTER_MIN_HEIGHT = 252;
