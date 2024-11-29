import { CallPolicy, Policy } from "@cartridge/controller";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CircleIcon,
  InfoIcon,
  CopyAddress,
} from "@cartridge/ui-next";
// import { useSessionSummary } from "@cartridge/utils";

export function SessionSummary({ policies }: { policies: Policy[] }) {
  // const { controller } = useConnection()
  // const { data: summary } = useSessionSummary({ policies, provider: controller });

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(summary.default).map(([address, calls]) => (
        <Contract key={address} address={address} calls={calls} />
      ))}

      {Object.entries(summary.ERC20).map(([address, calls]) => (
        <Contract key={address} address={address} calls={calls} />
      ))}

      {Object.entries(summary.ERC721).map(([address, calls]) => (
        <Contract key={address} address={address} calls={calls} />
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Sign Messages</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

function Contract({
  address,
  calls,
}: {
  address: string;
  calls: CallPolicy[];
}) {
  return (
    <Card>
      <div className="bg-background flex items-center h-full gap-px">
        <div className="w-10 h-full aspect-square bg-[image:var(--theme-icon-url)] bg-cover bg-center place-content-center" />

        <div className="text-sm bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3 text-medium">
          <div>Contract</div>
          <CopyAddress address={address} size="xs" className="" />
        </div>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <CardContent>
            <AccordionTrigger>
              You are agreeing to automate{" "}
              <span className="text-accent-foreground font-bold">
                {calls.length} method
                {calls.length > 1 ? "s" : ""}
              </span>
            </AccordionTrigger>
          </CardContent>

          <AccordionContent>
            {calls.map((c) => (
              <CardContent key={c.method} className="flex items-center gap-1">
                <CircleIcon size="sm" className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div>{c.method}</div>
                  <InfoIcon size="sm" className="text-muted-foreground" />
                </div>
              </CardContent>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

const summary = {
  default: {
    "0x000000000000000000000000000000000000000000000000000000000000000": [
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "method 1",
      },
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "method 2",
      },
    ],
  },
  ERC20: {
    "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": [
      {
        target:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        method: "approve",
      },
      {
        target:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        method: "transfer",
      },
    ],
  },
  ERC721: {
    "0x000000000000000000000000000000000000000000000000000000000000000": [
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "approve",
      },
      {
        target:
          "0x000000000000000000000000000000000000000000000000000000000000000",
        method: "transfer",
      },
    ],
  },
  messages: [
    {
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" },
        ],
        Person: [
          { name: "name", type: "felt" },
          { name: "wallet", type: "felt" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "felt" },
        ],
      },
      primaryType: "Mail",
      domain: {
        name: "StarkNet Mail",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
    },
  ],
};
