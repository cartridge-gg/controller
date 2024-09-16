import { HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react";
import { CartridgeLogo, WedgeUpIcon } from "@cartridge/ui";
import React, { useEffect, useMemo, useRef } from "react";
import {
  FOOTER_HEIGHT,
  PORTAL_WINDOW_HEIGHT,
  useLayout,
} from "components/layout";
import { motion } from "framer-motion";
import { SessionDetails } from "./SessionDetails";
import { isIframe } from "components/connect/utils";
import { SessionConsent } from "components/connect";
import { useConnection } from "hooks/connection";
import { TOP_BAR_HEIGHT } from "../Container/Header/TopBar";
import NextLink from "next/link";

export function Footer({
  children,
  isSlot,
  isSignup,
  hideTxSummary,
  showCatridgeLogo,
}: React.PropsWithChildren & {
  isSlot?: boolean;
  isSignup?: boolean;
  hideTxSummary?: boolean;
  showCatridgeLogo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>();
  const { origin, policies } = useConnection();
  const { variant, footer } = useLayout();
  const isExpandable = useMemo(
    () =>
      !!origin &&
      !!policies.length &&
      variant === "connect" &&
      !isSignup &&
      !hideTxSummary,
    [origin, policies, variant, isSignup, hideTxSummary],
  );
  const maxH = `${
    (isIframe() ? window.innerHeight : PORTAL_WINDOW_HEIGHT) - TOP_BAR_HEIGHT
  }px`;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        footer.setHeight(entry.contentRect.height);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [footer]);

  useEffect(() => {
    window.document.body.style.overflowY = footer.isOpen ? "hidden" : "auto";
  }, [footer.isOpen]);

  return (
    <VStack
      position={["fixed", "fixed", "absolute"]}
      bottom={0}
      w="full"
      zIndex={1}
      gap={0}
      as={isExpandable ? motion.div : undefined}
      layout="position"
      className="whatever"
      animate={{
        height: footer.isOpen ? maxH : "auto",
        transition: { bounce: 0 },
      }}
      backgroundColor="var(--chakra-colors-solid-bg)"
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
        h={`calc(${maxH} - ${footer.height}px)`}
      >
        <HStack
          align="flex-start"
          pt={isExpandable ? 6 : 0}
          onClick={footer.onToggle}
          _hover={{ cursor: "pointer" }}
        >
          {!hideTxSummary && !!policies.length && variant === "connect" && (
            <SessionConsent
              variant={isSlot ? "slot" : isSignup ? "signup" : undefined}
            />
          )}

          <Spacer />

          {isExpandable && (
            <IconButton
              aria-label="Expand footer"
              icon={
                <WedgeUpIcon
                  boxSize={8}
                  color="text.secondary"
                  transform={footer.isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                />
              }
              size="sm"
              h={8}
              bg="solid.primary"
              zIndex={1}
            />
          )}
        </HStack>

        {footer.isOpen && <SessionDetails />}
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

      {showCatridgeLogo && (
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
          as={NextLink}
          href="https://cartridge.gg"
          target="_blank"
          overflow="hidden"
          _hover={{
            color: "#FFC52A",
          }}
        >
          <Text fontSize="xs" fontWeight={500} color="currentColor">
            Controller by
          </Text>

          <CartridgeLogo fontSize={100} color="currentColor" />
        </HStack>
      )}
    </VStack>
  );
}

export const FOOTER_MIN_HEIGHT = 252;
