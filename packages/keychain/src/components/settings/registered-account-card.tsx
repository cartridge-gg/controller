import React from "react";
import {
  Button,
  Card,
  CardContent,
  TrashIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  ArgentIcon,
  CopyAddress,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { formatAddress } from "@cartridge/ui/utils";

export interface RegisteredAccount {
  accountName: string;
  accountAddress: string;
}

export interface SignerCardProps extends RegisteredAccount {
  onDelete?: () => void;
}

export const RegisteredAccountCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(({ className, accountName, accountAddress, onDelete, ...props }, ref) => {
  return (
    <Sheet>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="flex flex-1 flex-row items-center bg-background-100 border border-background-200">
          <CardContent className="py-2.5 px-3 flex items-center justify-between w-full">
            <div className="flex flex-row items-center gap-1.5">
              <ArgentIcon />
              <h1 className="flex-1 text-sm font-normal">{accountName}</h1>
            </div>
            <h1 className="text-xs text-foreground-300 font-normal">
              {formatAddress(accountAddress, { first: 4, last: 4 })}
            </h1>
          </CardContent>
        </Card>
        <SheetTrigger asChild>
          <Button variant="icon" size="icon" type="button">
            <TrashIcon size="default" className="text-foreground-300" />
          </Button>
        </SheetTrigger>
      </div>

      {/* DELETE SIGNER SHEET CONTENTS */}
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center"
          >
            <ArgentIcon />
          </Button>
          <div className="flex flex-col items-start gap-1">
            <div className="flex flex-col items-start gap-0.5">
              <h3 className="text-lg font-semibold text-foreground-100">
                {accountName}
              </h3>
              <div className="flex items-center text-xs font-normal text-foreground-300 gap-1">
                <CopyAddress
                  size="xs"
                  className="text-sm"
                  address={accountAddress}
                />
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button
            variant="secondary"
            onClick={onDelete}
            className="flex-1 text-destructive-100"
          >
            <TrashIcon size="default" />
            <span>DELETE</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

RegisteredAccountCard.displayName = "RegisteredAccountCard";
