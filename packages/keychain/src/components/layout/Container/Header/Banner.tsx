import { useControllerTheme } from "@/hooks/theme";
import { useMemo } from "react";
import { useLayoutVariant } from "../";
import { TOP_BAR_HEIGHT } from "./TopBar";
import { IconProps } from "@cartridge/ui-next";
import { useColorMode } from "@chakra-ui/react";

export type BannerProps = {
  Icon?: React.ComponentType<IconProps>;
  icon?: React.ReactElement;
  title: string | React.ReactElement;
  description?: string | React.ReactElement;
};

const ICON_SIZE = 80;
const ICON_OFFSET = 40;

export function Banner({ Icon, icon, title, description }: BannerProps) {
  const theme = useControllerTheme();
  const { colorMode } = useColorMode();
  const cover = useMemo(
    () =>
      typeof theme.cover === "string" ? theme.cover : theme.cover[colorMode],
    [theme, colorMode],
  );
  const variant = useLayoutVariant();

  switch (variant) {
    case "expanded":
      return (
        <div className="w-full flex flex-col items-center pb-6">
          <div
            className="h-[136px] w-full bg-cover bg-center relative mb-10 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-solid-bg before:pointer-events-none"
            style={{ backgroundImage: `url('${cover}')` }}
          >
            <div className="absolute -bottom-[10px] left-4">
              <div className="w-full flex items-center gap-4">
                <div className={`relative h-[${ICON_SIZE}px] w-[${ICON_SIZE}px] min-w-[${ICON_SIZE}px]`}>
                  <div className="absolute inset-0 border-4 border-solid-bg rounded-lg" />
                  <div className="bg-darkGray-700 rounded-lg h-full w-full flex justify-center items-center overflow-hidden">
                    {Icon ? (
                      <div className="rounded-full w-full h-full bg-solid-primary flex items-center justify-center">
                        <Icon size="lg" />
                      </div>
                    ) : icon ? (
                      <div className="rounded-full w-full h-full bg-solid-primary flex items-center justify-center">
                        {icon}
                      </div>
                    ) : (
                      <img
                        src={theme.icon}
                        className="w-full h-full object-cover"
                        alt="Controller Icon"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-1">
                  <span className="text-lg font-semibold">
                    {title}
                  </span>

                  {description && (
                    <span className="text-sm text-text-secondary">
                      {description}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case "compressed":
    default:
      return (
        <div className="w-full flex flex-col items-center">
          <div
            className={`h-[${TOP_BAR_HEIGHT / 4}px] w-full bg-cover bg-center pb-6`}
            style={{ backgroundImage: `url('${cover}')` }}
          />

          <div className="w-full p-4 flex items-center gap-4 min-w-0">
            {Icon ? (
              <div className="w-11 h-11 bg-solid-primary rounded-md flex items-center justify-center">
                <Icon size="lg" />
              </div>
            ) : icon ? (
              <div className="w-11 h-11 bg-solid-primary rounded-md flex items-center justify-center">
                {icon}
              </div>
            ) : (
              <img
                src={theme.icon}
                className="w-11 h-11 rounded-md"
                alt="Controller Icon"
              />
            )}

            <div className="w-full flex flex-col items-stretch gap-1 min-w-0">
              <span className="w-full text-lg font-semibold truncate">
                {title}
              </span>

              {description && (
                <span className="w-full text-xs text-text-secondary break-words">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
      );
  }
}
