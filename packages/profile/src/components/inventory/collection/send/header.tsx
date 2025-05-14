import { Thumbnail, PaperPlaneIcon } from "@cartridge/ui";

interface SendHeaderProps {
  image: string;
  title: string;
}

export function SendHeader({ image, title }: SendHeaderProps) {
  return (
    <div className="h-10 flex items-center justify-start gap-3 select-none">
      <Thumbnail
        icon={
          <PaperPlaneIcon
            variant="solid"
            size="lg"
            className="h-[30px] w-[30px]"
          />
        }
        size="lg"
      />
      <p className="text-lg/[24px] font-semibold">Send</p>
      <div className="h-full p-2 flex items-center gap-1 bg-background-150 rounded overflow-hidden">
        <Thumbnail icon={image} size="sm" />
        <p className="text-sm font-medium px-1 truncate">{title}</p>
      </div>
    </div>
  );
}
