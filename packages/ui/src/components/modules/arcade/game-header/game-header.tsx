import {
  AchievementContentProps,
  AchievementPinProps,
  CardTitle,
  DiscordIcon,
  DojoIcon,
  GitHubIcon,
  GlobeIcon,
  TelegramIcon,
  Thumbnail,
  XIcon,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { AchievementPinIcons } from "@/components/modules/achievements/pin-icons";

export interface Metadata {
  name: string;
  logo?: string;
  cover?: string;
}

export interface Socials {
  website?: string;
  discord?: string;
  telegram?: string;
  twitter?: string;
  github?: string;
}

export interface ArcadeGameHeaderProps
  extends VariantProps<typeof arcadeGameHeaderVariants> {
  metadata: Metadata;
  achievements?: {
    id: string;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
  }[];
  socials?: Socials;
  active?: boolean;
  className?: string;
  color?: string;
}

export const arcadeGameHeaderVariants = cva(
  "h-16 flex justify-between items-center px-4 py-3 gap-x-3",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-100",
        dark: "bg-background-100",
        default: "bg-background-200",
        light: "bg-background-200",
        lighter: "bg-background-200",
        lightest: "bg-background-200",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
type ArcadeGameHeaderVariant = VariantProps<
  typeof arcadeGameHeaderVariants
>["variant"];
export const ArcadeGameHeader = ({
  achievements,
  metadata,
  socials,
  active,
  variant,
  className,
  color,
}: ArcadeGameHeaderProps) => {
  const pins = useMemo(() => {
    if (!achievements) return [];
    return achievements
      .filter((a) => a.content.icon && a.pin?.pinned)
      .map((a) => ({
        id: a.id,
        icon: a.content.icon || "fa-trophy",
        name: a.content.title || "",
      }))
      .slice(0, 3);
  }, [achievements]);

  const style = useMemo(() => {
    const bgColor =
      !variant || variant === "default" || variant.includes("light")
        ? `var(--background-200)`
        : `var(--background-100)`;
    const opacity = metadata.cover ? "96%" : "50%";
    const image = metadata.cover
      ? `url(${metadata.cover})`
      : "var(--theme-cover-url)";
    return {
      backgroundImage: `linear-gradient(to right,${bgColor},color-mix(in srgb, ${bgColor} ${opacity}, transparent)),${image}`,
    };
  }, [metadata.cover, variant]);

  return (
    <div
      className={cn(
        arcadeGameHeaderVariants({ variant }),
        "bg-top bg-cover bg-no-repeat select-none",
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <Thumbnail
          icon={metadata.logo ?? <DojoIcon className="w-full h-full" />}
          variant={
            !variant || variant === "default" || variant?.includes("light")
              ? "light"
              : "default"
          }
          size="lg"
        />
        <div className="flex flex-col gap-x-4 gap-y-0.5 sm:flex-row">
          <CardTitle className="text-foreground-100 text-sm font-medium tracking-normal flex items-center whitespace-nowrap">
            {metadata.name}
          </CardTitle>
          {pins.length > 0 && (
            <AchievementPinIcons
              theme={active}
              pins={pins}
              variant={variant}
              className={className}
              color={color}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-1 sm:gap-x-2 gap-y-0.5 flex-wrap">
        {socials?.website && (
          <AchievementSocialWebsite
            website={socials.website}
            variant={variant}
          />
        )}
        {socials?.discord && (
          <AchievementSocialDiscord
            discord={socials.discord}
            variant={variant}
          />
        )}
        {socials?.twitter && (
          <AchievementSocialTwitter
            twitter={socials.twitter}
            variant={variant}
          />
        )}
        {socials?.telegram && (
          <AchievementSocialTelegram
            telegram={socials.telegram}
            variant={variant}
          />
        )}
        {socials?.github && (
          <AchievementSocialGithub github={socials.github} variant={variant} />
        )}
      </div>
    </div>
  );
};

export const AchievementSocialWebsite = ({
  website,
  variant,
  className,
}: {
  website: string;
  variant: ArcadeGameHeaderVariant;
  className?: string;
}) => {
  const label = useMemo(() => {
    return website.replace(/^.*https?:\/\//, "").replace(/\/$/, "");
  }, [website]);
  return (
    <AchievementSocial
      icon={<GlobeIcon variant="line" size="xs" />}
      href={website}
      label={label}
      variant={variant}
      className={className}
    />
  );
};

const AchievementSocialDiscord = ({
  discord,
  variant,
}: {
  discord: string;
  variant: ArcadeGameHeaderVariant;
}) => {
  return (
    <AchievementSocial
      icon={<DiscordIcon size="xs" />}
      href={discord}
      variant={variant}
    />
  );
};

const AchievementSocialTwitter = ({
  twitter,
  variant,
}: {
  twitter: string;
  variant: ArcadeGameHeaderVariant;
}) => {
  return (
    <AchievementSocial
      icon={<XIcon size="xs" />}
      href={twitter}
      variant={variant}
    />
  );
};

const AchievementSocialGithub = ({
  github,
  variant,
}: {
  github: string;
  variant: ArcadeGameHeaderVariant;
}) => {
  return (
    <AchievementSocial
      icon={<GitHubIcon size="xs" />}
      href={github}
      variant={variant}
    />
  );
};

const AchievementSocialTelegram = ({
  telegram,
  variant,
}: {
  telegram: string;
  variant: ArcadeGameHeaderVariant;
}) => {
  return (
    <AchievementSocial
      icon={<TelegramIcon size="xs" />}
      href={telegram}
      variant={variant}
    />
  );
};

const achievementSocialVariants = cva(
  "flex items-center gap-x-1 rounded px-1.5 py-1 cursor-pointer text-foreground-100",
  {
    variants: {
      variant: {
        darkest: "bg-background-100 hover:bg-background-200",
        darker: "bg-background-100 hover:bg-background-200",
        dark: "bg-background-100 hover:bg-background-200",
        default: "bg-background-200 hover:bg-background-300",
        light: "bg-background-200 hover:bg-background-300",
        lighter: "bg-background-200 hover:bg-background-300",
        lightest: "bg-background-200 hover:bg-background-300",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
type AchievementSocialVariant = VariantProps<
  typeof achievementSocialVariants
>["variant"];
export const AchievementSocial = ({
  icon,
  href,
  label,
  variant,
  className,
}: {
  icon: React.ReactNode;
  href: string;
  label?: string;
  variant: AchievementSocialVariant;
  className?: string;
}) => {
  return (
    <a
      href={href}
      draggable={false}
      target="_blank"
      className={cn(achievementSocialVariants({ variant }), className)}
    >
      {icon}
      {label && (
        <p className="px-0.5 text-xs font-medium tracking-normal hidden sm:block">
          {label}
        </p>
      )}
    </a>
  );
};

export default ArcadeGameHeader;
