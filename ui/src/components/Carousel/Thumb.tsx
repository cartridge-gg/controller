import React from "react";
import { Circle, Flex } from "@chakra-ui/react";
import Image from "next/future/image";

import PlayIcon from "../icons/Play";

const Thumb = ({
  uri,
  alt,
  selected,
  onClick,
}: {
  onClick: () => void;
  selected: boolean;
  uri: string;
  alt: string;
}) => {
  const ext = uri.split(".").pop();
  return (
    <Flex
      as="button"
      position="relative"
      align="center"
      justify="center"
      h={["100px", "150px"]}
      bg="gray.800"
      onClick={onClick}
      borderRadius="5px"
      overflow="hidden"
      outline="1px solid"
      outlineColor={selected ? "whiteAlpha.400" : "transparent"}
      opacity={selected ? "1" : "0.8"}
      transition="all 0.2s ease"
    >
      {ext === "mp4" ? (
        <Circle size="50px" bgColor="whiteAlpha.200">
          <PlayIcon />
        </Circle>
      ) : (
        <Image
          src={uri}
          alt={alt}
          style={{
            objectFit: "cover",
          }}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
          fill
        />
      )}
    </Flex>
  );
};

export default Thumb;
