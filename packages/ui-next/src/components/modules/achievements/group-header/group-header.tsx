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

export interface AchievmenetPinsProps {
  pins: { id: string; icon: string; name: string }[];
  empty: number;
}

export interface AchievementGroupHeaderProps
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
  const { pins, empty } = useMemo(() => {
    const pins = achievements
      .filter((a) => a.content.icon && a.pin?.pinned)
      .map((a) => ({
        id: a.id,
        icon: a.content.icon || "fa-trophy",
        name: a.content.title || "",
      }))
      .slice(0, 3);
    return { pins, empty: 3 - pins.length };
  }, [achievements]);

  const style = useMemo(() => {
    const bgColor =
      !variant || variant === "default"
        ? `var(--background-200)`
        : `var(--background-100)`;
    console.log(variant, bgColor);
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
        <div className="flex items-center gap-4">
          <CardTitle className="text-foreground-100 text-sm font-medium tracking-normal">
            {metadata.name}
          </CardTitle>
          {pins.length > 0 && (
            <AchievementPins pins={pins} empty={empty} variant={variant} />
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
  "w-9 h-9 flex justify-center items-center rounded",
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
        <img src={logo} alt={name} className="w-8 h-8 rounded" />
      ) : (
        <DojoIcon size="lg" />
      )}
    </div>
  );
};

const achievementPinsVariants = cva("flex items-center gap-1.5", {
  variants: {
    variant: {
      default: "",
      faded: "",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
type AchievementPinsVariant = VariantProps<
  typeof achievementPinsVariants
>["variant"];
const AchievementPins = ({
  pins,
  empty,
  variant,
}: AchievmenetPinsProps & { variant: AchievementPinsVariant }) => {
  return (
    <div className={achievementPinsVariants({ variant })}>
      {pins.map((value) => (
        <AchievementPin key={value.id} icon={value.icon} variant={variant} />
      ))}
      {Array.from({ length: empty }).map((_, index) => (
        <AchievementPin key={index} empty variant={variant} />
      ))}
    </div>
  );
};

const achievementPinVariants = cva(
  "w-6 h-6 border rounded flex justify-center items-center",
  {
    variants: {
      variant: {
        default: "border-background-300 bg-background-200",
        faded: "border-background-200 bg-background-100",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
type AchievementPinVariant = VariantProps<
  typeof achievementPinVariants
>["variant"];
const AchievementPin = ({
  icon,
  empty,
  variant,
}: {
  icon?: string;
  empty?: boolean;
  variant: AchievementPinVariant;
}) => {
  if (empty) {
    return (
      <div className={achievementPinVariants({ variant })}>
        <div className="w-3 h-3 fa-spider-web fa-thin text-background-500" />
      </div>
    );
  }
  if (!icon) return null;
  return (
    <div className={achievementPinVariants({ variant })}>
      <div className={cn("w-3 h-3 fa-solid text-foreground-100", icon)} />
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
  "flex items-center gap-x-1 rounded px-1.5 py-1",
  {
    variants: {
      variant: {
        default: "bg-background-200",
        faded: "bg-background-100",
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
        <p className="px-0.5 text-foreground-100 text-xs font-medium tracking-normal">
          {label}
        </p>
      )}
    </a>
  );
};

export default AchievementGroupHeader;
