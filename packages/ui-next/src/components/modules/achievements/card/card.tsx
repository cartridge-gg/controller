import {
  AchievementContent,
  AchievementContentProps,
  AchievementPagination,
  AchievementPin,
  AchievementPinProps,
  AchievementShare,
  AchievementShareProps,
  Card,
  CardHeader,
  CardTitle,
  cn,
} from "@/index";
import React from "react";

export interface AchievementCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  contentProps: AchievementContentProps;
  onPrevious?: () => void;
  onNext?: () => void;
  pinProps?: AchievementPinProps;
  shareProps?: AchievementShareProps;
}

export const AchievementCard = React.forwardRef<
  HTMLDivElement,
  AchievementCardProps
>(
  ({
    name,
    contentProps,
    onPrevious,
    onNext,
    pinProps,
    shareProps,
    children,
  }) => {
    return (
      <Card>
        <div className="flex flex-row gap-x-px">
          <CardHeader className="grow">
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          {children && (
            <AchievementPagination direction="left" onClick={onPrevious} />
          )}
          {children && (
            <AchievementPagination direction="right" onClick={onNext} />
          )}
          {children && <CardHeader>{children}</CardHeader>}
        </div>
        <div className="flex gap-x-px">
          <AchievementContent {...contentProps} />
          <div
            className={cn(
              "flex flex-col gap-y-px",
              !pinProps && !shareProps && "hidden",
            )}
          >
            {pinProps && <AchievementPin {...pinProps} />}
            {shareProps && <AchievementShare {...shareProps} />}
          </div>
        </div>
      </Card>
    );
  },
);

export default AchievementCard;
