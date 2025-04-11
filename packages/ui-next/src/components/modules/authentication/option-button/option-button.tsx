import { Button } from "@/components/primitives/button";
import { isValidElement, ReactElement } from "react";

interface OptionButtonProps extends React.ComponentProps<typeof Button> {
  icon: ReactElement;
}

function getComponentName(type: any): string | null {
  if (!type) {
    return null;
  }
  if (typeof type === "string") {
    return type;
  }
  if (typeof type === "function") {
    return type.displayName || type.name || null;
  }
  if (typeof type === "object") {
    return getComponentName(type.type) || type.displayName || null;
  }
  return null;
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
