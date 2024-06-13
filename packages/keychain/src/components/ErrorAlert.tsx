import { AlertIcon } from "@cartridge/ui";
import {
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spacer,
  HStack,
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
      color="text.primary"
      fontSize="sm"
    >
      <AccordionItem position="relative">
        <AccordionButton disabled={!description}>
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

          {description && <AccordionIcon boxSize={5} />}
        </AccordionButton>

        {description && (
          <AccordionPanel borderTop="1px solid" borderColor="translucent.soft">
            <Text color="inherit">{description}</Text>
          </AccordionPanel>
        )}
      </AccordionItem>
    </Accordion>
  );
}
