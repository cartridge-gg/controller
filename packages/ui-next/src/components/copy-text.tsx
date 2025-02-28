import { cn } from "@/utils";
import { CopyIcon } from "./icons";
import { toast } from "sonner";
import { useCallback } from "react";

export function CopyText({
  value,
  copyValue,
  className,
}: {
  value: string;
  copyValue?: string;
  className?: string;
}) {
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(copyValue ?? value);
    toast.success("Copied");
  }, [value, copyValue]);

  return (
    <div
      className={cn(
        "text-xs text-foreground-400 flex items-center gap-1 cursor-pointer",
        className,
      )}
      onClick={onCopy}
    >
      {value}

      <CopyIcon size="xs" />
    </div>
  );
}
