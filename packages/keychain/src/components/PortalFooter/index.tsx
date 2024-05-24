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
import React, { useMemo } from "react";
import { FOOTER_HEIGHT } from "components";
import { BANNER_HEIGHT, ICON_OFFSET, ICON_SIZE } from "components/Container/Header";
import { motion } from "framer-motion";

export function PortalFooter({
  children,
  origin,
  policies,
  isSignup,
  isSlot,
  showTerm = false,
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

  const height = useMemo(() =>
    isOpen
      ? `${window.document.body.scrollHeight
      - BANNER_HEIGHT
      - FOOTER_HEIGHT
      + ICON_SIZE / 2
      - ICON_OFFSET}px`
      : "auto",
    [isOpen])

  console.log("!!!", height);

  return (
    <VStack
      w="full"
      align="flex-start"
      position={["fixed", "fixed", "absolute"]}
      bottom={FOOTER_HEIGHT / 4}
      left={0}
      bg="solid.bg"
      p={4}
      pt={0}
      borderTopWidth={1}
      borderColor="solid.tertiary"
      zIndex="999999"
      as={motion.div}
      layout="position"
      animate={{ height, transition: { bounce: 0 } }}
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
              <motion.div
                layout
                animate={{ rotate: isOpen ? 180 : 0, transition: { bounce: 0 } }}
              >
                <WedgeUpIcon
                  boxSize={10}
                  color="text.secondary"
                />
              </motion.div>
            }
            size="lg"
            variant="round"
            bg="solid.bg"
            zIndex="999999"
            onClick={onToggle}
          />
        </Box>
      )
      }

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

    </VStack >
  );
}

export const PORTAL_FOOTER_MIN_HEIGHT = 252;
