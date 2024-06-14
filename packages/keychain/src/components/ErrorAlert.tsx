import { AlertIcon, WedgeDownIcon } from "@cartridge/ui";
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
      color="solid.bg"
      fontSize="sm"
    >
      <AccordionItem position="relative">
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

          {/* color does not seems to be applied */}
          {description && <AccordionIcon boxSize={5} color="solid.bg" />}
        </AccordionButton>

        {description && (
          <AccordionPanel>
            <Text color="solid.bg">{description}</Text>
          </AccordionPanel>
        )}
      </AccordionItem>
    </Accordion>
  );
}
