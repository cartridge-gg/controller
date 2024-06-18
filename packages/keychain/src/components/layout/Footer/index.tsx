import {
  HStack,
  IconButton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { CartridgeLogo, WedgeUpIcon } from "@cartridge/ui";
import React, { useEffect, useMemo, useRef } from "react";
import {
  FOOTER_HEIGHT,
  PORTAL_WINDOW_HEIGHT,
  useLayout,
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
  createSession = false,
}: React.PropsWithChildren & {
  isSlot?: boolean;
  createSession?: boolean;
}) {
  const { setFooterHeight } = useLayout();
  const ref = useRef<HTMLDivElement>();
  const { origin, policies } = useConnection();
  const { isOpen, onToggle } = useDisclosure();
  const variant = useLayoutVariant();
  const isExpandable = useMemo(
    () => !!origin && !!policies.length && variant === "connect",
    [origin, policies, variant],
  );
  const hostname = useMemo(
    () => (origin ? new URL(origin).hostname : undefined),
    [origin],
  );
  const maxH = `${
    (isIframe() ? window.innerHeight : PORTAL_WINDOW_HEIGHT) - TOP_BAR_HEIGHT
  }px`;
  const { footerHeight } = useLayout();

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setFooterHeight(entry.contentRect.height);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [setFooterHeight]);

  useEffect(() => {
    window.document.body.style.overflowY = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <VStack
      position={["fixed", "fixed", "absolute"]}
      bottom={0}
      w="full"
      zIndex={1}
      gap={0}
      as={motion.div}
      layout="position"
      className="whatever"
      animate={{ height: isOpen ? maxH : "auto", transition: { bounce: 0 } }}
      overflow="hidden"
      ref={ref}
    >
      <VStack
        w="full"
        align="stretch"
        bg="solid.bg"
        borderTopWidth={1}
        borderColor="solid.spacer"
        px={4}
        flex={1}
        h={`calc(${maxH} - ${footerHeight}px)`}
      >
        <HStack
          align="flex-start"
          pt={isExpandable ? 6 : 0}
          onClick={onToggle}
          _hover={{ cursor: "pointer" }}
        >
          <TransactionSummary
            isSlot={isSlot}
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
            />
          )}
        </HStack>

        {isOpen && <SessionDetails />}
      </VStack>

      <VStack
        justifySelf="flex-end"
        bg="solid.bg"
        w="full"
        align="stretch"
        p={4}
      >
        {children}
      </VStack>

      {variant === "connect" && (
        <HStack
          justifySelf="flex-end"
          bg="solid.bg"
          w="full"
          borderTopWidth={1}
          borderColor="solid.spacer"
          color="text.secondary"
          alignItems="center"
          justify="center"
          h={FOOTER_HEIGHT / 4}
          gap={1}
          opacity={0.5}
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
