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

export function Error({ error }: { error: Error }) {
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
          color="red.800"
          fontSize="sm"
        >
          <AccordionItem position="relative">
            <AccordionButton>
              <Text fontSize="2xs" color="inherit">
                Error Expected
              </Text>

              <Spacer />

              <AccordionIcon boxSize={5} />
            </AccordionButton>

            <AccordionPanel
              borderTop="1px solid"
              borderColor="translucent.soft"
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
}
