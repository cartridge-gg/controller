import { Button } from "@/components/primitives/button";
import { isValidElement, JSXElementConstructor, ReactElement } from "react";

interface OptionButtonProps extends React.ComponentProps<typeof Button> {
  icon: ReactElement;
}

type ComponentWithName = {
  displayName?: string;
  name?: string;
};

function getComponentName(
  elementType: string | JSXElementConstructor<unknown> | null | undefined,
): string | null {
  if (!elementType) {
    return null;
  }
  if (typeof elementType === "string") {
    return elementType;
  }
  // Attempt to get displayName or name from the component type
  const componentWithName = elementType as ComponentWithName;
  return componentWithName.displayName || componentWithName.name || null;
}

export function OptionButton({ icon, ...props }: OptionButtonProps) {
  let label = "";

  if (isValidElement(icon)) {
    const componentName = getComponentName(icon.type);
    if (componentName) {
      label = componentName.replace(/ColorIcon$/, "").replace(/Icon$/, "");
    }
  }

  return (
    <Button {...props}>
      {icon}
      {label}
    </Button>
  );
}
