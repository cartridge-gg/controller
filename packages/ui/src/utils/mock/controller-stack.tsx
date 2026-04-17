import { cn } from "@/utils";

export const ControllerStack = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-[432px] border border-solid border-background-300 p-4 m-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};
