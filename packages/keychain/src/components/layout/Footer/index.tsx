import { HStack, Text, VStack } from "@chakra-ui/react";
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
            color: "brand.primary",
          }}
        >
          <ControllerIcon height={22} />

          <Text fontSize="xs" fontWeight={500} color="currentColor">
            by
          </Text>

          <CartridgeLogo fontSize={100} color="currentColor" />
        </HStack>
      )}
    </VStack>
  );
}

const ControllerIcon = ({ height = 16 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M29.9624 15.6199H34.0374V20.3101H29.9624V15.6199Z"
      fill="currentColor"
    />
    <path
      d="M24.0364 44.3695H16.4368C15.9359 44.3695 15.9359 43.8659 15.9359 43.8659V24.8189C15.9359 24.8189 15.9359 24.32 16.4368 24.32H29.9623L29.9624 20.3101H24.9897C24.9897 20.3101 23.9832 20.3101 22.9767 20.809L13.4173 24.8189C12.4108 25.3178 11.9099 26.3249 11.9099 27.3227V43.3624C11.9099 43.8659 11.9099 44.3648 12.4108 44.8684L15.4303 47.8758C15.9312 48.3794 16.3104 48.3794 16.9377 48.3794H24.0375C24.038 47.1606 24.0386 45.7207 24.0391 44.3973H39.7827V48.3794H47.0623C47.6896 48.3794 48.0688 48.3794 48.5697 47.8758L51.5892 44.8684C52.0901 44.3695 52.0901 43.8659 52.0901 43.3624V27.3227C52.0901 26.3203 51.5892 25.3178 50.5827 24.8189L41.0233 20.809C40.0169 20.3101 39.0104 20.3101 39.0104 20.3101H34.0374L34.0374 24.32H47.5679C48.0688 24.32 48.0688 24.8189 48.0688 24.8189V43.8659C48.0688 43.8659 48.0688 44.3695 47.5679 44.3695H39.7978V40.4158H24.0403C24.0403 40.7994 24.0368 44.0341 24.0364 44.3695Z"
      fill="currentColor"
    />
    <path
      d="M24.0364 34.2617H39.7978V30.2802H24.0403C24.0403 30.687 24.0364 34.2992 24.0364 34.2617Z"
      fill="currentColor"
    />
  </svg>
);

export const FOOTER_MIN_HEIGHT = 252;
