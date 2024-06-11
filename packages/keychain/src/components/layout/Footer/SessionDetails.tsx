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

export function SessionDetails() {
  const policies = usePolicies();

  return (
    <VStack
      borderRadius="md"
      overflowY="hidden"
      rowGap="0.1rem"
      minH="min-content"
      marginY={4}
      alignItems="flex"
      as={motion.div}
      // Setting the initial display to `none` prevents the
      // div from being visible on the first render
      // which otherwise would cause a 'bouncy' effect.
      display="none"
      animate={{
        display: "flex",
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

      <Accordion w="full" allowMultiple overflowY="auto">
        {policies.map((p, i) => (
          <AccordionItem
            key={p.target + p.method}
            // The container already set border radius (for top & bottom), but we
            // set the bottom radius for the last item here because for certain
            // browsers' scrolling behaviour (eg Firefox) just to make it look nicer.
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
