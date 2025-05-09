import { StackDiamondIcon, Thumbnail, VerifiedIcon } from "@cartridge/ui";

export function CollectionHeader({
  title,
  subtitle,
  image,
  certified,
  count,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  certified?: boolean;
  count?: number;
}) {
  return (
    <div className="flex gap-3 items-center justify-start">
      <Thumbnail size="lg" icon={image} />
      <div className="flex flex-col gap-0.5 overflow-hidden">
        <div className="flex gap-2 items-center justify-between">
          <p className="text-foreground-100 text-lg/[22px] truncate">{title}</p>
          {count && (
            <div className="bg-background-200 px-1.5 py-0.5 rounded-full flex items-center">
              <StackDiamondIcon variant="solid" size="sm" />
              <p className="text-sm font-semibold text-foreground-100 tracking-wider px-0.5">
                {count}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-0.5 items-center text-foreground-300">
          {certified && <VerifiedIcon size="xs" />}
          <p className="text-xs">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
