import {
  ClockIcon,
  CollectibleTag,
  StackDiamondIcon,
  TagIcon,
  Thumbnail,
  VerifiedIcon,
} from "@cartridge/ui";
import { useEffect, useMemo, useState } from "react";

export function CollectionHeader({
  title,
  subtitle,
  image,
  certified,
  count,
  expiration,
  listingCount,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  certified?: boolean;
  count?: number;
  expiration?: number;
  listingCount?: number;
}) {
  const [state, setState] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    months: number;
    years: number;
  }>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    months: 0,
    years: 0,
  });

  const expirationLabel = useMemo(() => {
    if (state.years > 100) return "∞";
    if (state.years > 0) return `${state.years}y`;
    if (state.months > 0) return `${state.months}mo`;
    if (state.days > 0) return `${state.days}d`;
    if (state.hours > 0) return `${state.hours}h`;
    if (state.minutes > 0) return `${state.minutes}m`;
    return `${state.seconds}s`;
  }, [state]);

  useEffect(() => {
    if (!expiration) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = expiration * 1000 - now;
      if (diff <= 0) {
        setState({
          seconds: 0,
          minutes: 0,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        });
        return;
      }
      setState({
        seconds: Math.floor(diff / 1000),
        minutes: Math.floor(diff / (1000 * 60)),
        hours: Math.floor(diff / (1000 * 60 * 60)),
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        months: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)),
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiration]);

  return (
    <div className="flex gap-3 items-center justify-start">
      <Thumbnail size="lg" icon={image} />
      <div className="flex flex-col gap-0.5 overflow-hidden w-full">
        <div className="flex gap-2 items-center justify-between">
          <p className="text-foreground-100 text-lg/[22px] truncate">{title}</p>
          <div className="flex gap-2 items-center">
            {count && (
              <CollectibleTag
                label={`${count}`}
                className="px-1.5 bg-background-200 rounded-full"
              >
                <StackDiamondIcon variant="solid" size="sm" />
              </CollectibleTag>
            )}
            {expiration && (
              <CollectibleTag
                label={`${expirationLabel}`}
                className="px-1.5 bg-background-200 rounded-full"
              >
                <ClockIcon variant="solid" size="sm" />
              </CollectibleTag>
            )}
            {listingCount && (
              <CollectibleTag
                label={`${listingCount}`}
                className="px-1.5 bg-background-200 rounded-full"
              >
                <TagIcon variant="solid" size="sm" />
              </CollectibleTag>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 items-center text-foreground-300">
          {certified && <VerifiedIcon size="xs" />}
          <p className="text-xs">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
