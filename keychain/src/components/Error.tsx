import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Spacer,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";

export const Error = ({ error }: { error: Error }) => {
  return (
    <>
      {error && (
        <Accordion
          as={motion.div}
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          allowToggle
          variant="error"
          color="red.800"
          fontSize="11px"
        >
          <AccordionItem position="relative">
            <AccordionButton>
              <Text variant="ibm-upper-bold" fontSize="10px" color="inherit">
                Error Expected
              </Text>
              <Spacer />
              <InfoIcon boxSize="12px" />
            </AccordionButton>
            <AccordionPanel borderTop="1px solid" borderColor="blackAlpha.200">
              <VStack align="flex-start">
                <Text color="inherit" fontWeight="bold">
                  Error Details
                </Text>
                <Text color="inherit">{error?.message}</Text>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
