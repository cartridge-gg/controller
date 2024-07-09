import { AlertIcon, WedgeDownIcon } from "@cartridge/ui";
import {
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Spacer,
  HStack,
  Box,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactElement } from "react";

export function ErrorAlert({
  title,
  description,
}: {
  title: string;
  description?: string | ReactElement;
}) {
  return (
    <Accordion
      as={motion.div}
      w="full"
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      allowToggle
      variant="error"
      color="solid.bg"
      fontSize="sm"
    >
      <AccordionItem position="relative">
        {({ isExpanded }) => (
          <>
            <AccordionButton disabled={!description} color="solid.bg">
              <HStack>
                <AlertIcon />
                <Text
                  as="b"
                  fontSize="2xs"
                  color="inherit"
                  textTransform="uppercase"
                >
                  {title}
                </Text>
              </HStack>

              <Spacer />

              {description && (
                <Box
                  as={motion.div}
                  animate={{
                    rotate: isExpanded ? 180 : 0,
                  }}
                >
                  <WedgeDownIcon boxSize={5} color="solid.bg" />
                </Box>
              )}
            </AccordionButton>

            {description && (
              <AccordionPanel maxH={200}>
                <Text color="solid.bg">{description}</Text>
              </AccordionPanel>
            )}
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
}
