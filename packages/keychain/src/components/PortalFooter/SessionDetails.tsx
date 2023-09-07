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
import { CodeIcon, WedgeRightIcon } from "@cartridge/ui";
import { Policy } from "@cartridge/controller";

export function SessionDetails({
  hostname,
  policies,
}: {
  hostname: string;
  policies: Policy[];
}) {
  if (!policies) {
    return null;
  }

  return (
    <VStack marginY={4} alignItems="flex">
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
                    {<CodeIcon boxSize={4} />}
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
