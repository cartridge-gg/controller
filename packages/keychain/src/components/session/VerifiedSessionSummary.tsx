import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@cartridge/ui-next";
import { ParsedSessionPolicies } from "hooks/session";
import { formatAddress } from "@cartridge/utils";
import { Text } from "@chakra-ui/react";
import { CodeIcon } from "@cartridge/ui";

export function VerifiedSessionSummary({
  policies,
}: {
  policies: ParsedSessionPolicies;
}) {
  const totalMethods = Object.values(policies).flatMap((contracts) =>
    Object.values(contracts).flatMap(({ methods }) => methods),
  ).length;

  const totalMessages = policies.messages?.length ?? 0;

  return (
    <Card>
      <CardHeader icon={<CodeIcon boxSize="24px" m={2} />}>
        <Text color="text.primary" fontSize="xs" fontWeight="bold">
          PLAY GAME
        </Text>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          <AccordionItem value="contracts">
            <AccordionTrigger>
              <Text color="text.secondary" fontSize="xs">
                Approve{" "}
                <Text as="span" color="text.secondary" fontWeight="bold">
                  {totalMethods} methods
                </Text>{" "}
                {totalMessages > 0 && (
                  <>
                    and{" "}
                    <Text as="span" color="text.secondary" fontWeight="bold">
                      {totalMessages} messages
                    </Text>
                  </>
                )}
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                {Object.entries(policies).map(([category, contracts]) =>
                  Object.entries(contracts).map(([address, { meta }]) => (
                    <CardContent>
                      {meta?.name || category}{" "}
                      <span className="text-muted-foreground ml-2">
                        {formatAddress(address)}
                      </span>
                    </CardContent>
                  )),
                )}
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
