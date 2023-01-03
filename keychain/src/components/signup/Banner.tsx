import { Box, StyleProps } from "@chakra-ui/react";
import Image from "next/future/image";

const Banner = ({
  imgSrc,
  obscuredWidth,
  ...rest
}: {
  imgSrc?: string;
  obscuredWidth: string;
} & StyleProps) => {
  return (
    <Box
      h="200px"
      w="full"
      position="relative"
      left={`calc(${obscuredWidth} / 2)`}
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
        bg="linear-gradient(180deg, rgba(15,20,16,0.2) 0%, #0F1410 100%)"
      />
    </Box>
  );
};

export default Banner;
