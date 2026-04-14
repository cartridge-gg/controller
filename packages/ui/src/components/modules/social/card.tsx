import React, { useState } from "react";
import { cn } from "@/utils";
import { Thumbnail } from "../thumbnails";
import { CheckIcon } from "@/components/icons";

export interface SocialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  icon: React.ReactNode;
  handle?: string;
  isDisabled?: boolean;
  isCompleted?: boolean;
  isExpired?: boolean;
  onClick?: () => void;
}

export const SocialCard = ({
  text,
  icon,
  handle,
  isDisabled,
  isCompleted,
  isExpired,
  className,
  onClick,
  ...props
}: SocialCardProps) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cn(
        "group flex flex-row gap-2 justify-between",
        "w-full h-[48px] px-3 py-2.5 items-left",
        "first:rounded-t-md last:rounded-b-md",
        "bg-background-200",
        "text-foreground-100 text-base text-normal",
        onClick !== undefined
          ? "cursor-pointer hover:bg-background-300 transition-colors ease-in-out"
          : "pointer-events-none",
        (isDisabled || isCompleted) && "bg-background-150 pointer-events-none",
        className,
      )}
      onClick={isDisabled || isCompleted ? undefined : onClick}
      onMouseEnter={() => onClick !== undefined && setHover(true)}
      onMouseLeave={() => onClick !== undefined && setHover(false)}
      {...props}
    >
      <Thumbnail
        icon={isCompleted ? <CheckIcon /> : icon}
        size="sm"
        variant={hover ? "lighter" : "light"}
        rounded={true}
        className={cn(
          "w-[28px] h-[28px] p-1",
          (isDisabled || isCompleted) &&
            "text-foreground-400 bg-background-200",
        )}
      />
      <div
        className={cn(
          "flex-1 items-left m-auto text-sm",
          (isDisabled || isCompleted) && "text-foreground-400",
        )}
      >
        {text}
      </div>
      {handle && (
        <div
          className={cn(
            "flex items-center gap-1 text-foreground-200 text-sm border border-background-300 group-hover:border-background-400 rounded px-1 py-0.5",
            (isDisabled || isCompleted) && "text-foreground-400",
            isExpired && "text-destructive-100",
          )}
        >
          <span className="font-normal text-sm">{handle}</span>
        </div>
      )}
    </div>
  );
};
