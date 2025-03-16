import { ArcadeIcon } from "@/index";
import { useMemo } from "react";

export interface ArcadeHeaderProps extends React.PropsWithChildren {
  cover?: string;
}

export const ArcadeHeader = ({ cover, children }: ArcadeHeaderProps) => {
  const style = useMemo(() => {
    const bgColor = "var(--background-100)";
    const opacity = "50%";
    const image = cover ? `url(${cover})` : "var(--theme-cover-url)";
    return {
      backgroundImage: `linear-gradient(to right,${bgColor},color-mix(in srgb, ${bgColor} ${opacity}, transparent)),${image}`,
    };
  }, [cover]);

  return (
    <div className="w-full flex gap-x-px h-14">
      <div className="flex items-center justify-center bg-background-100 text-primary w-14">
        <ArcadeIcon className="w-8 h-8" />
      </div>
      <div
        className="grow flex justify-end items-center gap-2 px-3 py-2 bg-center bg-cover bg-no-repeat select-none"
        style={style}
      >
        {children}
      </div>
    </div>
  );
};

export default ArcadeHeader;
