import {
  Flex,
  HStack,
  Text,
  TextProps,
  UseToastOptions,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { CopyIcon } from "./icons";

export function CopyText({
  value,
  copyValue,
  toastOptions = DEFAULT_TOAST_OPTIONS,
  ...textProps
}: {
  value: string;
  copyValue?: string;
  toastOptions?: UseToastOptions;
} & TextProps) {
  const toast = useToast(toastOptions);

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(copyValue ?? value);
    toast();
  }, [toast, value, copyValue]);

  return (
    <HStack
      color="brand.primary"
      cursor="pointer"
      gap={0.5}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <Text color="inherit" {...textProps}>
        {value}
      </Text>

      <CopyIcon
        color="inherit"
        visibility={isHovered ? "visible" : "hidden"}
        fontSize={textProps.fontSize}
      />
    </HStack>
  );
}

export const DEFAULT_TOAST_OPTIONS: UseToastOptions = {
  title: "Copied!",
  position: "top",
  render: Toaster,
  duration: 2000,
};

function Toaster({ title }: UseToastOptions) {
  return (
    <Flex bg="translucent.md" borderRadius="md" p={2} justifyContent="center">
      {title}
    </Flex>
  );
}
