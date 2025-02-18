import {
  AchievementContentProps,
  AchievementPinProps,
  CardTitle,
  cn,
  DiscordIcon,
  DojoIcon,
  GitHubIcon,
  GlobeIcon,
  TelegramIcon,
  XIcon,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { AchievementPinIcons } from "../pin-icons";

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

interface AchievementGroupHeaderProps
  extends VariantProps<typeof achievementGroupHeaderVariants> {
  achievements: {
    id: string;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
  }[];
  metadata: Metadata;
  socials?: Socials;
}

export const achievementGroupHeaderVariants = cva(
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
type AchievementGroupHeaderVariant = VariantProps<
  typeof achievementGroupHeaderVariants
>["variant"];
export const AchievementGroupHeader = ({
  achievements,
  metadata,
  socials,
  variant,
}: AchievementGroupHeaderProps) => {
  const pins = useMemo(() => {
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
        achievementGroupHeaderVariants({ variant }),
        "bg-top bg-cover bg-no-repeat select-none",
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <AchievementLogo
          logo={metadata.logo}
          name={metadata.name}
          variant={variant}
        />
        <div className="flex flex-col gap-x-4 gap-y-0.5 md:flex-row">
          <CardTitle className="text-foreground-100 text-sm font-medium tracking-normal">
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

const achievementLogoVariants = cva(
  "w-11 h-11 flex justify-center items-center rounded md:w-9 md:h-9",
  {
    variants: {
      variant: {
        default: "bg-background-300",
        faded: "bg-background-200",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
type AchievementLogoVariant = VariantProps<
  typeof achievementLogoVariants
>["variant"];
const AchievementLogo = ({
  logo,
  name,
  variant,
}: {
  logo?: string;
  name: string;
  variant: AchievementLogoVariant;
}) => {
  return (
    <div className={achievementLogoVariants({ variant })}>
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="w-[36px] h-[36px] rounded md:w-8 md:h-8"
        />
      ) : (
        <DojoIcon size="lg" />
      )}
    </div>
  );
};

const AchievementSocialWebsite = ({
  website,
  variant,
}: {
  website: string;
  variant: AchievementGroupHeaderVariant;
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
  variant: AchievementGroupHeaderVariant;
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
  variant: AchievementGroupHeaderVariant;
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
  variant: AchievementGroupHeaderVariant;
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
  variant: AchievementGroupHeaderVariant;
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
        <p className="px-0.5 text-foreground-100 text-xs font-medium tracking-normal hidden md:block">
          {label}
        </p>
      )}
    </a>
  );
};

export default AchievementGroupHeader;
