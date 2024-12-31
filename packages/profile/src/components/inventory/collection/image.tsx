import { cn } from "@cartridge/ui-next";

export const CollectionImage = ({
  imageUrl = "/public/placeholder.svg",
  size = "md",
}: {
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) => {
  return (
    <div
      className={cn(
        "bg-cover bg-center flex h-full w-full place-content-center overflow-hidden select-none",
        {
          "p-0.5": size === "xs",
          "p-1": size === "sm",
          "p-2": size === "md",
          "p-3": size === "lg",
          "p-4": size === "xl",
        },
      )}
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${imageUrl})`,
      }}
    >
      <img
        className="object-contain transition group-hover:scale-110 select-none"
        draggable={false}
        src={imageUrl}
      />
    </div>
  );
};
