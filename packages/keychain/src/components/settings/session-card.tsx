import React from "react";
import {
  cn,
  // Button,
  Card,
  // TrashIcon,
  Sheet,
  ShapesIcon,
  // SheetClose,
  // SheetFooter,
} from "@cartridge/ui-next";

export interface Session {
  sessionName: string;
}

export interface SessionCardProps extends Session {
  onDelete?: () => void;
}

export const SessionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SessionCardProps
>(({ className, sessionName, ...props }, ref) => {
  return (
    <Sheet>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="py-2.5 px-3 gap-1.5 flex flex-1 flex-row items-center bg-background-200">
          <ShapesIcon variant="solid" size="default" />
          <p className="flex-1 text-sm font-normal">
            {sessionName.toUpperCase().replace(/[_-]/g, " ")}
          </p>
        </Card>
      </div>

      {/* DELETE SESSION SHEET CONTENTS */}
      {/* <SheetFooter className="flex flex-row items-center gap-4"> */}
      {/*   <SheetClose asChild className="flex-1"> */}
      {/*     <Button variant="secondary">Cancel</Button> */}
      {/*   </SheetClose> */}
      {/*   <Button */}
      {/*     variant="secondary" */}
      {/*     onClick={onDelete} */}
      {/*     className="flex-1 text-destructive-100" */}
      {/*   > */}
      {/*     <TrashIcon size="default" /> */}
      {/*     <span>DELETE</span> */}
      {/*   </Button> */}
      {/* </SheetFooter> */}
    </Sheet>
  );
});

SessionCard.displayName = "SessionCard";
