import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@/components/primitives";
import { cn, formatAddress } from "@/utils";
import React from "react";

export const enum StarterpackStatus {
  CLAIMED = "Claimed",
  CLAIMABLE = "Claimable",
}

export interface StarterpackDetailsProps {
  status: StarterpackStatus;
  createdBy: string;
  owner: string;
  claimedOn: Date;
}

export const StarterpackDetails = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterpackDetailsProps
>(({ status, createdBy, owner, claimedOn, className, ...props }, ref) => {
  return (
    <Card className={cn(className)} {...props} ref={ref}>
      <CardHeader className="py-2.5 px-3">
        <CardTitle className="normal-case font-semibold text-xs w-full flex items-center justify-between">
          Contents
        </CardTitle>
      </CardHeader>

      <CardListContent className="font-normal text-sm">
        <CardListItem className="flex flex-row items-center justify-between p-3 bg-background-200">
          <span className="text-foreground-300">Status</span>
          <span
            className={cn(
              status === StarterpackStatus.CLAIMED
                ? "text-foreground-400"
                : "text-constructive",
            )}
          >
            {status.toString()}
          </span>
        </CardListItem>
        <CardListItem className="flex flex-row items-center justify-between p-3 bg-background-200">
          <span className="text-foreground-300">Created By</span>
          <span>{createdBy}</span>
        </CardListItem>
        <CardListItem className="flex flex-row items-center justify-between p-3 bg-background-200">
          <span className="text-foreground-300">Owner</span>
          <span>{formatAddress(owner, { first: 4, last: 4 })}</span>
        </CardListItem>
        <CardListItem className="flex flex-row items-center justify-between p-3 bg-background-200">
          <span className="text-foreground-300">Claimed On</span>
          <span>{formatDate(claimedOn)}</span>
        </CardListItem>
      </CardListContent>
    </Card>
  );
});

StarterpackDetails.displayName = "StarterPackDetails";

const formatDate = (date: Date): string => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  // Format time in 12-hour format with am/pm
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM

  return `${month} ${day}${suffix}, ${year} at ${hours}:${minutes} ${ampm}`;
};
