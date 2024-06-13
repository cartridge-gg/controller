import {
  HStack,
  IconButton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { CartridgeLogo, WedgeUpIcon } from "@cartridge/ui";
import React, { useMemo } from "react";
import {
  FOOTER_HEIGHT,
  PORTAL_WINDOW_HEIGHT,
  useLayoutVariant,
} from "components/layout";
import { motion } from "framer-motion";
import { SessionDetails } from "./SessionDetails";
import { TransactionSummary } from "./TransactionSummary";
import { isIframe } from "components/connect/utils";
import { useConnection } from "hooks/connection";
import { TOP_BAR_HEIGHT } from "../Container/Header/TopBar";

export function Footer({
  children,
  isSlot = false,
  showTerm = false,
  createSession = false,
}: React.PropsWithChildren & {
  isSlot?: boolean;
  showTerm?: boolean;
  createSession?: boolean;
}) {
  const { origin, policies } = useConnection();
  const { isOpen, onToggle } = useDisclosure();
  const isExpandable = useMemo(
    () => !!origin && !!policies.length,
    [origin, policies],
  );
  const hostname = useMemo(
    () => (origin ? new URL(origin).hostname : undefined),
    [origin],
  );
  const height = useMemo(
    () =>
      isOpen
        ? `${
            (isIframe() ? window.innerHeight : PORTAL_WINDOW_HEIGHT) -
            TOP_BAR_HEIGHT -
            FOOTER_HEIGHT
          }px`
        : "auto",
    [isOpen],
  );
  const variant = useLayoutVariant();
  const showLogo = useMemo(() => variant === "connect", [variant]);

  return (
    <VStack
      position={["fixed", "fixed", "absolute"]}
      bottom={0}
      w="full"
      zIndex={1}
      gap={0}
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
        <VStack align="stretch" w="full" h="full">
          <HStack align="flex-start" pt={isExpandable ? 6 : 0}>
            <TransactionSummary
              isSlot={isSlot}
              showTerm={showTerm}
              createSession={createSession}
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
                zIndex={1}
                onClick={onToggle}
              />
            )}
          </HStack>

          {isOpen && <SessionDetails />}
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
