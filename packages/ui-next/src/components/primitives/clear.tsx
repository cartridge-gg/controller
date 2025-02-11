import { SpinnerIcon, TimesCircleIcon } from "@cartridge/ui-next";

type ClearProps = {
  isLoading: boolean;
  onClear: () => void;
};

export const Clear = ({ isLoading, onClear }: ClearProps) => {
  return (
    <div
      className="h-9 w-9 p-1.5 flex items-center justify-center cursor-pointer"
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
