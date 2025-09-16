import { Thumbnail, PaperPlaneIcon, TagIcon } from "@cartridge/ui";

interface HeaderProps {
  image?: string;
  title?: string;
}

export function SendHeader({ image, title }: HeaderProps) {
  return (
    <Header
      image={image}
      title={title}
      label="Send"
      Icon={
        <PaperPlaneIcon
          variant="solid"
          size="lg"
          className="h-[30px] w-[30px]"
        />
      }
    />
  );
}

export function ReviewHeader() {
  return (
    <Header
      label="Review Transaction"
      Icon={
        <PaperPlaneIcon
          variant="solid"
          size="lg"
          className="h-[30px] w-[30px]"
        />
      }
    />
  );
}

export function ListHeader({ image, title }: HeaderProps) {
  return (
    <Header
      image={image}
      title={title}
      label="List"
      Icon={<TagIcon variant="solid" size="lg" className="h-[30px] w-[30px]" />}
    />
  );
}

function Header({
  image,
  title,
  label,
  Icon,
}: HeaderProps & { label: string; Icon: React.ReactNode }) {
  return (
    <div className="h-10 flex items-center justify-start gap-3 select-none">
      <Thumbnail icon={Icon} size="lg" />
      <p className="text-lg/[24px] font-semibold">{label}</p>
      {title && (
        <div className="h-full p-2 flex items-center gap-1 bg-background-150 rounded overflow-hidden">
          <Thumbnail icon={image} size="sm" />
          <p className="text-sm font-medium px-1 truncate">{title}</p>
        </div>
      )}
    </div>
  );
}
