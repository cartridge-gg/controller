import { Input } from "@chakra-ui/react";

export function ShadowInput({ value }: { value: string }) {
  return (
    <Input
      position="absolute"
      width="calc(100% - 28px)"
      opacity={0.5}
      pointerEvents="none"
      value={value.length > 0 ? value + ".gg" : ""}
      readOnly
    />
  );
}
