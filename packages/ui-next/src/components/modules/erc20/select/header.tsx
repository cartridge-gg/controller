import { CaratIcon, SelectTrigger, SelectValue } from "@/index";

export const TokenSelectHeader = (
  props: React.ComponentProps<typeof SelectTrigger>,
) => {
  return (
    <SelectTrigger
      className="h-10 w-fit rounded-full flex gap-2 items-center p-2"
      {...props}
    >
      <SelectValue placeholder="Select Token" />
      <CaratIcon variant="down" size="sm" className="text-foreground-300" />
    </SelectTrigger>
  );
};
