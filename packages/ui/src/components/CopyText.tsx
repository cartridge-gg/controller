import {
  Box,
  Flex,
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

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();

      navigator.clipboard.writeText(copyValue ?? value);
      toast();
    },
    [toast, value, copyValue],
  );

  return (
    <>
      <Box
        color="brand.primary"
        cursor="pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        alignItems="center"
        display="inline-flex"
      >
        <Text color="inherit" {...textProps}>
          {value}
        </Text>

        <CopyIcon
          color="inherit"
          visibility={isHovered ? "visible" : "hidden"}
          fontSize={textProps.fontSize}
          ml={0.5}
        />
      </Box>
    </>
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
