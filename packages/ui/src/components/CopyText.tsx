import {
  Flex,
  HStack,
  Text,
  UseToastOptions,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { CopyIcon } from "./icons";

export function CopyText({
  value,
  toastOptions = {
    title: "Copied!",
    position: "top",
    render: Toaster,
    duration: 2000,
  },
}: {
  value: string;
  toastOptions?: UseToastOptions;
}) {
  const toast = useToast(toastOptions);

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(value);
    toast();
  }, [toast, value]);

  return (
    <HStack
      color="brand.primary"
      cursor="pointer"
      gap={0.5}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <Text color="inherit">{value}</Text>

      <CopyIcon color="inherit" visibility={isHovered ? "visible" : "hidden"} />
    </HStack>
  );
}

function Toaster({ title }: UseToastOptions) {
  return (
    <Flex bg="translucent.md" borderRadius="md" p={2} justifyContent="center">
      {title}
    </Flex>
  );
}
