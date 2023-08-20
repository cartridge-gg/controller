import { Box, StyleProps } from "@chakra-ui/react";
import Image from "next/future/image";

export function BannerImage({
  imgSrc,
  ...rest
}: {
  imgSrc?: string;
} & StyleProps) {
  return (
    <Box
      h="200px"
      w="full"
      position="fixed"
      zIndex={-1}
      userSelect="none"
      overflow="hidden"
      {...rest}
    >
      {imgSrc && (
        <Image
          src={imgSrc}
          alt="banner"
          style={{ objectFit: "cover" }}
          sizes="100vw"
          fill
          priority
        />
      )}
      <Box
        h="full"
        w="full"
        bottom="0"
        left="0"
        position="absolute"
        bg="linear-gradient(180deg, rgba(15,20,16,0.2) 0%, #161A17 100%)"
      />
    </Box>
  );
}
