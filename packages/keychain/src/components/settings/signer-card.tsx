import React from "react";
import {
  cn,
  Button,
  Card,
  TrashIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  StarknetIcon,
  TouchIcon,
} from "@cartridge/ui-next";
import { SignerType } from "@cartridge/utils/api/cartridge";

export interface Signer {
  signerType: SignerType;
}

export interface SignerCardProps extends Signer {
  onDelete?: () => void;
}

export const SignerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(({ className, signerType, onDelete, ...props }, ref) => {
  return (
    <Sheet>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="py-2.5 px-3 gap-1.5 flex flex-1 flex-row items-center bg-background-200">
          <DeviceIcon signerType={signerType} />
          <p className="flex-1 text-sm font-normal">
            {signerType === SignerType.Starknet
              ? "Starknet Account"
              : signerType === SignerType.Webauthn
                ? "WebAuthn"
                : "Unknown"}
          </p>
        </Card>
        {/* disabled until delete signer functionality is implemented */}
        {/* <SheetTrigger asChild> */}
        {/*   <Button variant="icon" size="icon" type="button"> */}
        {/*     <TrashIcon size="default" className="text-foreground-300" /> */}
        {/*   </Button> */}
        {/* </SheetTrigger> */}
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
            <DeviceIcon signerType={signerType} />
          </Button>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-foreground-100">
              {signerType === SignerType.Starknet
                ? "Starknet Account"
                : signerType === SignerType.Webauthn
                  ? "WebAuthn"
                  : "Unknown"}
            </h3>
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

SignerCard.displayName = "SignerCard";

const DeviceIcon = React.memo(({ signerType }: { signerType: SignerType }) => {
  return signerType === SignerType.Starknet ? (
    <StarknetIcon size="default" />
  ) : signerType === SignerType.Webauthn ? (
    <TouchIcon size="default" />
  ) : (
    <TouchIcon size="default" />
  );
});
