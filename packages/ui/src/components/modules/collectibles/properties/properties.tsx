import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CollectibleProperty,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export type Property = {
  name: string;
  value: string | number | null | undefined;
};

export interface CollectiblePropertiesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectiblePropertiesVariants> {
  properties: Property[];
}

const collectiblePropertiesVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function CollectibleProperties({
  properties,
  variant,
  className,
  ...props
}: CollectiblePropertiesProps) {
  return (
    <Card
      {...props}
      className={cn(collectiblePropertiesVariants({ variant }), className)}
    >
      <CardHeader className="h-10">
        <CardTitle className="text-xs text-foreground-400 font-semibold tracking-wider">
          Properties
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-background grid grid-cols-3 p-0 gap-px">
        {properties.map((property, index) => (
          <CollectibleProperty
            key={`${property.name}-${index}`}
            name={property.name}
            value={
              property.value || property.value === 0
                ? String(property.value)
                : "?"
            }
          />
        ))}
        {Array.from({ length: 2 - ((properties.length - 1) % 3) }).map(
          (_, i) => (
            <div
              key={`fill-${i}`}
              className="bg-background-150 p-3 flex flex-col gap-1"
            />
          ),
        )}
      </CardContent>
    </Card>
  );
}

export default CollectibleProperties;
