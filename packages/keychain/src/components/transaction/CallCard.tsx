import { useConnection } from "#hooks/connection";
import {
  Card,
  CardContent,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";
import { useExplorer } from "@starknet-react/core";
import { constants, Call } from "starknet";

interface CallCardProps {
  address: string;
  title: string;
  call: Call;
  icon?: React.ReactNode;
}

export function CallCard({ address, call }: CallCardProps) {
  const { controller } = useConnection();
  const explorer = useExplorer();

  const explorerLink = (
    <a
      className="text-xs text-foreground cursor-pointer hover:underline"
      href={
        controller?.chainId() === constants.StarknetChainId.SN_MAIN ||
        controller?.chainId() === constants.StarknetChainId.SN_SEPOLIA
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
      <CardContent className="py-2">
        <Accordion key={`${call.entrypoint}`} type="single" collapsible>
          <AccordionItem value="item" className="bg-background-200 rounded-md">
            <AccordionTrigger className="px-1 py-2">
              <p className=" text-foreground font-bold text-s">
                {humanizeString(call.entrypoint)}
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground-400 font-bold">
                    Contract
                  </div>
                  {explorerLink}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground-400 font-bold">
                    Entrypoint
                  </div>
                  <div className="text-xs text-foreground">
                    {call.entrypoint}
                  </div>
                </div>

                {call.calldata && (
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-foreground-400 font-bold pb-1">
                      Calldata
                    </div>
                    <div className="flex flex-col gap-1">
                      {Array.isArray(call.calldata)
                        ? call.calldata.map((data, i) => (
                            <div key={i} className="text-xs text-foreground">
                              {String(data)}
                            </div>
                          ))
                        : Object.entries(call.calldata).map(
                            ([key, value], i) => (
                              <div key={i} className="text-xs text-foreground">
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
