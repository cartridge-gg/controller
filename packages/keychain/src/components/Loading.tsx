import {
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Skeleton,
} from "@cartridge/ui";

interface PageLoadingProps {
  headerVariant?: "expanded" | "hidden";
  title?: string;
  description?: string | React.ReactElement;
}

export function PageLoading({
  headerVariant = "expanded",
  title = "Connect Controller",
  description,
}: PageLoadingProps = {}) {
  return (
    <>
      <HeaderInner
        variant={headerVariant}
        title={title}
        description={description}
        hideIcon
      />

      <LayoutContent className="overflow-y-hidden">
        {/* Username input skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-11 w-full rounded" />
        </div>

        {/* Legal text skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </div>
      </LayoutContent>

      <LayoutFooter>
        {/* Error alert skeleton (optional) */}
        <Skeleton className="h-16 w-full rounded" />

        {/* Button skeleton */}
        <Skeleton className="h-11 w-full rounded" />
      </LayoutFooter>
    </>
  );
}
