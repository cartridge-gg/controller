import { cn, IconProps } from "@cartridge/ui-next";

export type BannerProps = {
  Icon?: React.ComponentType<IconProps>;
  icon?: React.ReactElement;
  title: string | React.ReactElement;
  description?: string | React.ReactElement;
  variant?: BannerVariant;
};

export type BannerVariant = "expanded" | "compressed";

export function Banner({
  Icon,
  icon,
  title,
  description,
  variant = "compressed",
}: BannerProps) {
  switch (variant) {
    case "expanded":
      return (
        <div className="flex flex-col w-full h-[136px] bg-[image:var(--theme-cover-url)] bg-cover bg-center relative mb-16 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-background before:pointer-events-none">
          <div className="p-4 flex items-center gap-4 absolute -bottom-10 left-1">
            <HeaderIcon variant={variant} Icon={Icon} icon={icon} />
            <Headline
              variant={variant}
              title={title}
              description={description}
            />
          </div>
        </div>
      );
    case "compressed":
    default:
      return (
        <div className="flex flex-col">
          <div className="w-full bg-[image:var(--theme-cover-url)] bg-cover bg-center h-14 pb-6" />
          <div className="p-4 flex items-center gap-4">
            <HeaderIcon variant={variant} Icon={Icon} icon={icon} />
            <Headline
              variant={variant}
              title={title}
              description={description}
            />
          </div>
        </div>
      );
  }
}

function HeaderIcon({
  variant,
  Icon,
  icon,
}: Pick<BannerProps, "variant" | "Icon" | "icon">) {
  return (
    <IconWrapper variant={variant}>
      {(() => {
        if (Icon) {
          return <Icon size="lg" />;
        }

        if (icon) {
          return icon;
        }

        return (
          <div className="size-full rounded bg-[image:var(--theme-icon-url)] bg-cover bg-center" />
        );
      })()}
    </IconWrapper>
  );
}

function IconWrapper({
  variant,
  children,
}: {
  variant?: BannerVariant;
  children: React.ReactNode;
}) {
  switch (variant) {
    case "expanded":
      return (
        <div className="rounded size-20 bg-background flex items-center justify-center">
          <div className="rounded bg-background-100 size-[calc(100%-8px)] flex items-center justify-center">
            {children}
          </div>
        </div>
      );
    default:
    case "compressed":
      return (
        <div className="rounded size-11 flex items-center justify-center bg-background-100">
          {children}
        </div>
      );
  }
}

function Headline({
  variant,
  title,
  description,
}: Pick<BannerProps, "variant" | "title" | "description">) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="text-lg font-semibold line-clamp-1 text-ellipsis">
        {title}
      </div>

      {description && (
        <div
          className={cn(
            "text-muted-foreground break-words",
            variant === "compressed" ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </div>
      )}
    </div>
  );
}
