import {
  AchievementContentProps,
  AchievementPinProps,
  CardTitle,
  cn,
  DiscordIcon,
  GitHubIcon,
  GlobeIcon,
  TelegramIcon,
  XIcon,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { AchievementPinIcons } from "@/components/modules/achievements/pin-icons";
import { ArcadeGameIcon } from "../game-icon";

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
}

export const arcadeGameHeaderVariants = cva(
  "h-16 flex justify-between items-center px-4 py-3 gap-x-3",
  {
    variants: {
      variant: {
        default: "bg-foreground-200",
        faded: "bg-background-100",
        ghost: "",
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
  variant,
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
      !variant || variant === "default"
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
        <ArcadeGameIcon
          logo={metadata.logo}
          name={metadata.name}
          variant={variant}
        />
        <div className="flex flex-col gap-x-4 gap-y-0.5 sm:flex-row">
          <CardTitle className="text-foreground-100 text-sm font-medium tracking-normal flex items-center">
            {metadata.name}
          </CardTitle>
          {pins.length > 0 && (
            <AchievementPinIcons pins={pins} variant={variant} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-x-2">
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

const AchievementSocialWebsite = ({
  website,
  variant,
}: {
  website: string;
  variant: ArcadeGameHeaderVariant;
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
  "flex items-center gap-x-1 rounded px-1.5 py-1 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-background-200 hover:bg-background-300",
        faded: "bg-background-100 hover:bg-background-200",
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
const AchievementSocial = ({
  icon,
  href,
  label,
  variant,
}: {
  icon: React.ReactNode;
  href: string;
  label?: string;
  variant: AchievementSocialVariant;
}) => {
  return (
    <a
      href={href}
      draggable={false}
      target="_blank"
      className={achievementSocialVariants({ variant })}
    >
      {icon}
      {label && (
        <p className="px-0.5 text-foreground-100 text-xs font-medium tracking-normal hidden sm:block">
          {label}
        </p>
      )}
    </a>
  );
};

export default ArcadeGameHeader;
