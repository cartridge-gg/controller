import {
  Button,
  cn,
  ShoppingCancelIcon,
  ShoppingCartIcon,
  TagIcon,
} from "@/index";

export interface CollectibleItemActionProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "list" | "unlist" | "purchase";
}

export function CollectibleItemAction({
  variant,
  className,
  ...props
}: CollectibleItemActionProps) {
  return (
    <Button
      variant="secondary"
      className={cn("min-h-10 min-w-10 p-0", className)}
      aria-label="Action item"
      {...props}
    >
      {(() => {
        switch (variant) {
          case "list":
            return <TagIcon variant="solid" size="default" />;
          case "unlist":
            return (
              <ShoppingCancelIcon
                variant="solid"
                size="default"
                className="text-destructive-100"
              />
            );
          case "purchase":
            return (
              <ShoppingCartIcon
                variant="solid"
                size="default"
                className="text-constructive-100"
              />
            );
          default:
            return null;
        }
      })()}
    </Button>
  );
}

export default CollectibleItemAction;
