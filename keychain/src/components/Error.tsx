import {
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spacer,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

export const Error = ({ error }: { error: Error }) => {
  return (
    <>
      {error && (
        <Accordion
          as={motion.div}
          w="full"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          allowToggle
          variant="error"
          color="legacy.red.800"
          fontSize="11px"
        >
          <AccordionItem position="relative">
            <AccordionButton>
              <Text variant="ibm-upper-bold" fontSize="10px" color="inherit">
                Error Expected
              </Text>
              <Spacer />
              <AccordionIcon boxSize="14px" />
            </AccordionButton>
            <AccordionPanel
              borderTop="1px solid"
              borderColor="legacy.blackAlpha.200"
            >
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
