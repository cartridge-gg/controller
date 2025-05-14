import { useConnection } from "@/hooks/connection";
import {
  Card,
  CardContent,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Address,
} from "@cartridge/ui";
import { useExplorer } from "@starknet-react/core";
import { constants, Call } from "starknet";
import { useState, useEffect } from "react";

interface CallCardProps {
  address: string;
  title: string;
  call: Call;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
}

// Utility function to detect if a value is a hex address
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isHexAddress(value: any): boolean {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40,64}$/.test(value);
}

// Utility function to detect if a value is likely a number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumeric(value: any): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return !isNaN(Number(value)) && !isHexAddress(value);
}

// Utility function to copy text to clipboard
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
}

// Component for clickable value that can be copied
function CopyableValue({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <span
      onClick={() => copyToClipboard(value)}
      className="cursor-pointer hover:opacity-80 relative group"
      title="Click to copy"
    >
      {children}
    </span>
  );
}

// Utility function to format different types of data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-foreground-200">null</span>;
  }

  if (typeof value === "boolean") {
    return (
      <CopyableValue value={String(value)}>
        <Badge variant={value ? "primary" : "destructive"}>
          {value ? "true" : "false"}
        </Badge>
      </CopyableValue>
    );
  }

  if (isHexAddress(value)) {
    return (
      <CopyableValue value={value}>
        <Address address={value} first={6} last={4} copyable={false} />
      </CopyableValue>
    );
  }

  if (isNumeric(value)) {
    const stringValue = String(value);
    return (
      <CopyableValue value={stringValue}>
        <span className="font-mono text-secondary">{stringValue}</span>
      </CopyableValue>
    );
  }

  if (typeof value === "object") {
    // Handle BigInt objects that might be stringified
    if (
      typeof value.toString === "function" &&
      /^\d+$/.test(value.toString())
    ) {
      const stringValue = value.toString();
      return (
        <CopyableValue value={stringValue}>
          <span className="font-mono text-secondary">{stringValue}</span>
        </CopyableValue>
      );
    }

    // Handle Uint256 objects
    if (value.low !== undefined && value.high !== undefined) {
      // Convert low and high to a single number if possible
      const lowNum = BigInt(value.low);
      const highNum = BigInt(value.high) << BigInt(128);
      const fullNum = (highNum + lowNum).toString();

      return (
        <CopyableValue value={fullNum}>
          <span className="font-mono text-secondary">{fullNum}</span>
        </CopyableValue>
      );
    }

    // Handle Cairo enums
    if (value.variant !== undefined && value.value !== undefined) {
      return (
        <div className="flex flex-col">
          <CopyableValue value={value.variant}>
            <Badge className="self-start mb-1">{value.variant}</Badge>
          </CopyableValue>
          {value.value !== null && (
            <div className="pl-2 border-l text-foreground-400">
              {formatValue(value.value)}
            </div>
          )}
        </div>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-foreground-200">[]</span>;
      }

      return (
        <div className="flex flex-col">
          <div className="pl-2 border-l text-foreground-400 flex flex-col gap-1">
            {value.map((item, i) => (
              <div key={i} className="flex text-foreground">
                <span className="text-foreground-200 min-w-[24px]">{i}:</span>
                {formatValue(item)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle other objects
    try {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-foreground-200">{"{}"}</span>;
      }

      return (
        <div className="flex flex-col">
          <div className="pl-2 border-l text-foreground-400 flex flex-col gap-1">
            {entries.map(([key, val], i) => (
              <div key={i} className="flex flex-col">
                <span className="text-foreground-200 font-bold">{key}:</span>
                <div className="pl-2 text-foreground">{formatValue(val)}</div>
              </div>
            ))}
          </div>
        </div>
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return (
        <span className="text-foreground-200">
          {Object.prototype.toString.call(value)}
        </span>
      );
    }
  }

  // Default string representation
  const stringValue = String(value);
  return (
    <CopyableValue value={stringValue}>
      <span>{stringValue}</span>
    </CopyableValue>
  );
}

// Component to render calldata items
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CalldataItem({ data, index }: { data: any; index: number }) {
  return (
    <div className="text-xs bg-background-300 p-2 rounded-md break-all">
      <div className="flex items-start">
        <span className="text-foreground-200 mr-2 font-mono">{index}:</span>
        <div className="flex-1">{formatValue(data)}</div>
      </div>
    </div>
  );
}

// Component to render calldata as key-value pairs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CalldataKeyValue({ keyName, value }: { keyName: string; value: any }) {
  return (
    <div className="text-xs bg-background-300 p-2 rounded-md break-all">
      <div className="flex flex-col">
        <span className="text-foreground-200 font-bold mb-1">{keyName}:</span>
        <div className="pl-2">{formatValue(value)}</div>
      </div>
    </div>
  );
}

export function CallCard({
  address,
  call,
  defaultExpanded = false,
}: CallCardProps) {
  const { controller } = useConnection();
  const explorer = useExplorer();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Update expansion state when defaultExpanded prop changes
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

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
      <Address address={address} first={5} last={5} />
    </a>
  );

  return (
    <Card>
      <CardContent className="py-2">
        <Accordion
          key={`${call.entrypoint}`}
          type="single"
          collapsible
          value={isExpanded ? "item" : ""}
          onValueChange={(value) => setIsExpanded(value === "item")}
        >
          <AccordionItem value="item" className="bg-background-200 rounded-md">
            <AccordionTrigger className="px-1 py-2">
              <div className="flex items-center gap-2">
                <p className="text-foreground font-bold text-s">
                  {humanizeString(call.entrypoint)}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground-200 font-bold">
                    Contract
                  </div>
                  {explorerLink}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-foreground-200 font-bold">
                    Entrypoint
                  </div>
                  <div className="text-xs text-foreground">
                    <CopyableValue value={call.entrypoint}>
                      {call.entrypoint}
                    </CopyableValue>
                  </div>
                </div>

                {call.calldata && (
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-foreground-200 font-bold pb-1">
                      Calldata
                    </div>
                    <div className="flex flex-col gap-1">
                      {Array.isArray(call.calldata)
                        ? call.calldata.map((data, i) => (
                            <CalldataItem key={i} data={data} index={i} />
                          ))
                        : Object.entries(call.calldata).map(
                            ([key, value], i) => (
                              <CalldataKeyValue
                                key={i}
                                keyName={key}
                                value={value}
                              />
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
