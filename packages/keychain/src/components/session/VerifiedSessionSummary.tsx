import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@cartridge/ui-next";
import { ParsedSessionPolicies } from "hooks/session";
import { formatAddress } from "@cartridge/utils";

export function VerifiedSessionSummary({
  policies,
}: {
  policies: ParsedSessionPolicies;
}) {
  const totalMethods = Object.values(policies).flatMap((contracts) =>
    Object.values(contracts).flatMap(({ methods }) => methods),
  ).length;
  const totalContracts = Object.values(policies).flatMap((contracts) =>
    Object.keys(contracts),
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">
          Approve {totalMethods} methods across {totalContracts} contracts
        </CardTitle>
      </CardHeader>

      <Accordion type="multiple">
        {Object.entries(policies).map(([category, contracts]) =>
          Object.entries(contracts).map(([address, { meta }]) => (
            <AccordionItem key={address} value={address}>
              <CardContent>
                <AccordionTrigger>
                  {meta?.name || category}{" "}
                  <span className="text-muted-foreground ml-2">
                    {formatAddress(address)}
                  </span>
                </AccordionTrigger>
              </CardContent>

              {/* <AccordionContent>
                {methods.map((method) => (
                  <CardContent
                    key={method.entrypoint}
                    className="flex items-center gap-2 py-2"
                  >
                    <CircleIcon size="sm" className="text-muted-foreground" />
                    <div>
                      <div>{method.name}</div>
                      {method.description && (
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      )}
                    </div>
                  </CardContent>
                ))}
              </AccordionContent> */}
            </AccordionItem>
          )),
        )}
      </Accordion>
    </Card>
  );
}
