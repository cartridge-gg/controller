import {
  HStack,
  VStack,
  Text,
  Link,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Accordion,
  Spacer,
  AccordionPanel,
} from "@chakra-ui/react";
import { CodeIcon, LockIcon } from "@cartridge/ui";
import { Policy } from "@cartridge/controller";

export function TransactionSummary({
  isOpen,
  origin,
  policies,
}: {
  isOpen: boolean;
  origin: string;
  policies: Policy[];
}) {
  return (
    <VStack
      align="flex-start"
      p={4}
      overflowY={isOpen ? "scroll" : "hidden"}
      css={{
        "::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
      }}
      marginBottom="120px" // footer child height
    >
      <HStack color="text.secondary" fontSize="xs">
        {<CodeIcon boxSize={4} />}
        <Text color="text.secondary">{<>Create a session for {origin}</>}</Text>
      </HStack>

      <Terms />

      {policies && (
        <VStack marginY={4}>
          <VStack
            align="flex-start"
            borderTopRadius={8}
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
              Allow {origin} to execute following actions on your behalf
            </Text>
          </VStack>

          <Accordion w="full" allowMultiple={true} position="relative" top={-4}>
            {policies.map((p) => (
              <AccordionItem key={p.target + p.method}>
                <AccordionButton>
                  <HStack>
                    {<CodeIcon boxSize={4} />}
                    <Text>{p.method}</Text>
                  </HStack>

                  <Spacer />

                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel>TODO: description</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      )}
    </VStack>
  );
}

function Terms() {
  return (
    <HStack align="flex-start">
      <LockIcon color="text.secondary" boxSize={4} />
      <Text fontSize="xs" color="text.secondary">
        By continuing you are agreeing to Cartridge&apos;s{" "}
        <Link
          textDecoration="underline"
          href="https://cartridgegg.notion.site/Cartridge-Terms-of-Use-a7e65445041449c1a75aed697b2f6e62"
          isExternal
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          textDecoration="underline"
          href="https://cartridgegg.notion.site/Cartridge-Privacy-Policy-747901652aa34c6fb354c7d91930d66c"
          isExternal
        >
          Privacy Policy
        </Link>
      </Text>
    </HStack>
  );
}
