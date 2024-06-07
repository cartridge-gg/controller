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
import { motion } from "framer-motion";
import { usePolicies } from "hooks/connection";

export function SessionDetails({
  isOpen,
}: {
  isOpen: boolean;
}) {
  const policies = usePolicies();

  return (
    <VStack
      borderRadius="md"
      overflow="hidden"
      rowGap="0.1rem"
      minH={"min-content"}
      marginY={4}
      alignItems="flex"
      as={motion.div}
      animate={{
        display: isOpen ? "flex" : "none",
        transition: { delay: 0.3 },
      }}
    >
      <VStack align="flex-start" bg="solid.primary" p={3}>
        <Text
          color="text.secondaryAccent"
          fontSize="xs"
          fontWeight="bold"
          casing="uppercase"
        >
          Session details
        </Text>
      </VStack>

      <Accordion w="full" allowMultiple overflowY="scroll">
        {policies.map((p, i) => (
          <AccordionItem
            key={p.target + p.method}
            borderBottomRadius={i === policies.length - 1 ? "md" : "none"}
            isDisabled={!p.description}
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
                    <CodeUtilIcon boxSize={4} />
                    <Text>{p.method}</Text>
                  </HStack>

                  <Spacer />

                  {p.description && (
                    <WedgeRightIcon
                      fontSize="2xl"
                      transform={isExpanded ? "rotate(90deg)" : undefined}
                      transition="all 0.2s ease"
                      color="text.secondary"
                    />
                  )}
                </AccordionButton>

                {p.description && (
                  <AccordionPanel>{p.description}</AccordionPanel>
                )}
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
}
