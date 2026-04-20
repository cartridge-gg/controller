import { SpinnerIcon, TimesCircleIcon } from "@/index";

type ClearProps = {
  isLoading: boolean;
  onClear: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export const Clear = ({ isLoading, onClear }: ClearProps) => {
  return (
    <div
      className="h-9 w-9 p-1.5 flex items-center justify-center cursor-pointer"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClear}
    >
      {isLoading ? (
        <SpinnerIcon className=" text-foreground-300 animate-spin" />
      ) : (
        <TimesCircleIcon className="text-foreground-300 hover:text-foreground-200" />
      )}
    </div>
  );
};
