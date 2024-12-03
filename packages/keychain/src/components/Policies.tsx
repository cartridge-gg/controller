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
import { SessionPolicies } from "@cartridge/controller";

export function Policies({
  title,
  policies,
}: {
  title?: string;
  policies: SessionPolicies;
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
        {policies.map((p, i) => {
          const isCallPolicy = "target" in p && "method" in p;
          const key = isCallPolicy
            ? `${p.target}${p.method}`
            : `${p.domain.name}${p.primaryType}`;

          return (
            <AccordionItem
              key={key}
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
                      {isCallPolicy ? (
                        <>
                          <FnIcon boxSize={5} />
                          <Text>{p.method}</Text>
                        </>
                      ) : (
                        <Text>Sign Message</Text>
                      )}
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
                      {isCallPolicy ? (
                        <>
                          <CopyHash hash={p.target} />
                          {p.description && (
                            <Text w="full" color="inherit">
                              {p.description}
                            </Text>
                          )}
                        </>
                      ) : (
                        <>
                          <Text w="full" color="inherit">
                            Domain: {p.domain.name}
                          </Text>
                          <Text w="full" color="inherit">
                            Primary Type: {p.primaryType}
                          </Text>
                          <Text w="full" color="inherit">
                            Types:
                          </Text>
                          {Object.keys(p.types).map((key) =>
                            key === "StarknetDomain" ||
                            key === "StarkNetDomain" ? null : (
                              <Text key={key} w="full" color="inherit">
                                {key}: {JSON.stringify(p.types[key])}
                              </Text>
                            ),
                          )}
                        </>
                      )}
                    </VStack>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
}
