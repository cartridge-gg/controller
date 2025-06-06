import { Spinner } from "@cartridge/ui";
import { useState } from "react";

export const RevokeAllSessionsButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div
      className="flex justify-center items-center 
		py-1.5 px-2 gap-0.5 rounded-[4px]
		transition-colors duration-300 ease-in-out
		text-sm font-normal
		text-foreground-300 hover:bg-background-200 hover:text-destructive-100
		cursor-pointer"
      onClick={async () => {
        if (isLoading) return;
        try {
          setIsLoading(true);
          await onClick();
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? <Spinner size="sm" /> : "Revoke All"}
    </div>
  );
};
