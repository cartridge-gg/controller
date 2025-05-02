import { Button } from "@/components/primitives/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";
import { ReactElement } from "react";

interface OptionButtonProps extends React.ComponentProps<typeof Button> {
  icon: ReactElement;
  label: string;
}

export function OptionButton({ icon, label, ...props }: OptionButtonProps) {
  const { isLoading, disabled, ...restProps } = props;

  return (
    <Button
      {...restProps}
      className={cn(restProps.className, "w-full h-fit px-3 py-2.5 gap-2")}
      isLoading={false}
      disabled={isLoading || disabled}
    >
      {isLoading ? <Spinner size="sm" /> : icon}
      {label}
    </Button>
  );
}
