import {
  HStack,
  VStack,
  Text,
  AccordionButton,
  AccordionItem,
  Accordion,
  Spacer,
  AccordionPanel,
} from "@chakra-ui/react";
import { CodeUtilIcon, WedgeRightIcon } from "@cartridge/ui";
import { Policy } from "@cartridge/controller";
import { motion } from "framer-motion";

export function SessionDetails({
  hostname,
  policies,
  isOpen,
}: {
  hostname: string;
  policies: Policy[];
  isOpen: boolean;
}) {
  if (!policies) {
    return null;
  }

  return (
    <VStack
      marginY={4}
      alignItems="flex"
      as={motion.div}
      layoutScroll
      animate={{
        display: isOpen ? "flex" : "none",
        transition: { delay: 0.3 },
      }}
      display="none"
    >
      <VStack
        align="flex-start"
        borderTopRadius="md"
        bg="solid.primary"
        p={3}
        m={0}
      >
        <Text
          color="text.secondaryAccent"
          fontSize="xs"
          fontWeight="bold"
          casing="uppercase"
        >
          Session details
        </Text>
        <Text color="text.secondaryAccent" fontSize="xs">
          Allow {hostname} to execute following actions on your behalf
        </Text>
      </VStack>

      <Accordion w="full" allowMultiple position="relative" top={-4}>
        {policies.map((p, i) => (
          <AccordionItem
            key={p.target + p.method}
            borderBottomRadius={i === policies.length - 1 ? "md" : "none"}
            isDisabled // disable until action metadata is supported
          >
            {({ isExpanded }) => (
              <>
                <AccordionButton
                  _disabled={{
                    cursor: "auto",
                    opacity: 1,
                  }}
                >
                  <HStack>
                    {<CodeUtilIcon boxSize={4} />}
                    <Text>{p.method}</Text>
                  </HStack>

                  <Spacer />

                  <WedgeRightIcon
                    fontSize="2xl"
                    transform={isExpanded ? "rotate(90deg)" : undefined}
                    transition="all 0.2s ease"
                    color="text.secondary"
                    display="none" // here also
                  />
                </AccordionButton>

                <AccordionPanel>TODO: description</AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
}
