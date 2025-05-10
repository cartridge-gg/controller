import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Card,
  DiscordIcon,
  MetaMaskIcon,
  PhantomIcon,
  RabbyIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  StarknetIcon,
  TouchIcon,
  TrashIcon,
  WalletConnectIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import React from "react";
import { getControllerSignerProvider } from "../connect/types";
export interface Signer {
  signer: CredentialMetadata;
}

export interface SignerCardProps extends Signer {
  onDelete?: () => void;
}

export const SignerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(({ className, signer, onDelete, ...props }, ref) => {
  const signerType = getControllerSignerProvider(signer);
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
            {signerType ? AUTH_METHODS_LABELS[signerType] : "Unknown"}
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
              {signerType ? AUTH_METHODS_LABELS[signerType] : "Unknown"}
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

const DeviceIcon = React.memo(
  ({ signerType }: { signerType: AuthOption | undefined }) => {
    if (!signerType) {
      return <TouchIcon size="sm" />;
    }

    switch (signerType) {
      case "argent":
        return <StarknetIcon size="sm" />;
      case "webauthn":
        return <TouchIcon size="sm" />;
      case "phantom":
        return <PhantomIcon size="sm" />;
      case "rabby":
        return <RabbyIcon size="sm" />;
      case "metamask":
        return <MetaMaskIcon size="sm" />;
      case "discord":
        return <DiscordIcon size="sm" />;
      case "walletconnect":
        return <WalletConnectIcon size="sm" />;
      default:
        return <TouchIcon size="sm" />;
    }
  },
);
