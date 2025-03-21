import { ThumbnailCollectible } from "@cartridge/ui-next";

export function CollectionHeader({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 items-center justify-start">
      <ThumbnailCollectible image={image} size="lg" />
      <div className="flex flex-col gap-0.5">
        <p className="text-foreground-100 text-base/[22px]">{title}</p>
        {subtitle}
      </div>
    </div>
  );
}
