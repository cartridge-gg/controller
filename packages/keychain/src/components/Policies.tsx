import {
  HStack,
  VStack,
  Text,
  AccordionButton,
  AccordionItem,
  Accordion,
  Spacer,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { CopyHash, FnIcon, WedgeRightIcon } from "@cartridge/ui";
import { CallPolicy } from "@cartridge/controller";

export function CallPolicies({
  title,
  policies,
}: {
  title?: string;
  policies: CallPolicy[];
}) {
  return (
    <Box position="relative">
      {title && (
        <VStack
          align="flex-start"
          bg="solid.primary"
          p={3}
          position="sticky"
          top={0}
          borderTopRadius="base"
        >
          <Text
            color="text.secondaryAccent"
            fontSize="xs"
            fontWeight="bold"
            casing="uppercase"
          >
            {title}
          </Text>
        </VStack>
      )}

      <Accordion w="full" allowMultiple overflowY="auto">
        {policies.map((p, i) => (
          <AccordionItem
            key={p.target + p.method}
            borderTopRadius={i === 0 && !title ? "base" : "none"}
            // The container already set border radius (for top & bottom), but we
            // set the bottom radius for the last item here because for certain
            // browsers' scrolling behaviour (eg Firefox) just to make it look nicer.
            borderBottomRadius={i === policies?.length - 1 ? "base" : "none"}
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
                    <FnIcon boxSize={5} />
                    <Text>{p.method}</Text>
                  </HStack>

                  <Spacer />

                  <WedgeRightIcon
                    fontSize="2xl"
                    transform={isExpanded ? "rotate(90deg)" : undefined}
                    transition="all 0.2s ease"
                    color="text.secondary"
                  />
                </AccordionButton>

                <AccordionPanel>
                  <VStack align="flex-start" w="full" p={3}>
                    <CopyHash hash={p.target} />
                    {p.description && (
                      <Text w="full" color="inherit">
                        {p.description}
                      </Text>
                    )}
                  </VStack>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}
