import {
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CodeIcon,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useExplorer } from "@starknet-react/core";
import { constants, Call } from "starknet";
import { useChainId } from "@/hooks/connection";

interface CallCardProps {
  address: string;
  title: string;
  call: Call;
  icon?: React.ReactNode;
}

export function CallCard({ address, call, title, icon }: CallCardProps) {
  const chainId = useChainId();
  const explorer = useExplorer();

  const explorerLink = (
    <a
      className="text-xs text-muted-foreground cursor-pointer hover:underline"
      href={
        chainId === constants.StarknetChainId.SN_MAIN ||
        chainId === constants.StarknetChainId.SN_SEPOLIA
          ? explorer.contract(address)
          : `#`
      }
      target="_blank"
      rel="noreferrer"
    >
      {formatAddress(address, { first: 5, last: 5 })}
    </a>
  );

  return (
    <Card>
      <CardHeader icon={icon ?? <CodeIcon variant="solid" />} className="pl-0">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase">{title}</div>
          {explorerLink}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-2">
          <Accordion key={`${call.entrypoint}`} type="single" collapsible>
            <AccordionItem value="item" className="bg-secondary rounded-md">
              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="text-foreground font-bold text-xs">
                    {humanizeString(call.entrypoint)}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-3">
                <div className="flex flex-col gap-2">
                  {call.calldata && (
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-muted-foreground font-bold pb-2">
                        Calldata
                      </div>
                      <div className="flex flex-col gap-2">
                        {Array.isArray(call.calldata)
                          ? call.calldata.map((data, i) => (
                              <div
                                key={i}
                                className="text-xs text-muted-foreground"
                              >
                                {String(data)}
                              </div>
                            ))
                          : Object.entries(call.calldata).map(
                              ([key, value], i) => (
                                <div
                                  key={i}
                                  className="text-xs text-muted-foreground"
                                >
                                  {`${key}: ${String(value)}`}
                                </div>
                              ),
                            )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

function humanizeString(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
