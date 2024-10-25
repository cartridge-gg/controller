import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { CartridgeLogo } from "@cartridge/ui";
import React, { useEffect, useRef } from "react";
import { FOOTER_HEIGHT, useLayout } from "components/layout";
import NextLink from "next/link";

export function Footer({
  children,
  showCatridgeLogo,
}: React.PropsWithChildren & {
  showCatridgeLogo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>();
  const { footer } = useLayout();

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
      bgColor="solid.bg"
      overflow="hidden"
      ref={ref}
    >
      <Spacer bg="solid.bg" borderTopWidth={1} borderColor="solid.spacer" />

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
