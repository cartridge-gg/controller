import React, { useState, useRef } from "react";
import { Card } from "../Card";
import { Flex, Circle, Box, Spinner } from "@chakra-ui/react";
import Image from "next/future/image";
import PlayIcon from "../icons/Play";

// TODO: implement poster for video and thumbnail
const INFLUENCE_FRAME = 3;

export type SlideProps = {
  uri: string;
  alt: string;
};

const Video = ({
  src,
  poster,
  frame = 0,
}: {
  src: string;
  poster?: string;
  frame?: number;
}) => {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [controls, setControls] = useState(false);
  return (
    <>
      <Box
        as="video"
        position="absolute"
        top="0"
        left="0"
        h="full"
        w="full"
        src={src + "#t=" + frame}
        preload={frame ? "metadata" : undefined}
        poster={poster}
        objectFit="cover"
        controls={controls}
        ref={vidRef as any}
      />
      {!controls && (
        <Circle
          as="button"
          size="100px"
          bgColor="whiteAlpha.200"
          zIndex="overlay"
          onClick={() => {
            if (!vidRef.current) {
              return
            }

            vidRef.current.currentTime = 0;
            vidRef.current.play();
            setControls(true);
          }}
          _hover={{
            bgColor: "whiteAlpha.300",
          }}
        >
          <PlayIcon fill="white" transform="scale(2)" />
        </Circle>
      )}
    </>
  );
};

export const Slide = ({ uri, alt }: SlideProps) => {
  const ext = uri.split(".").pop();
  return (
    <Card
      position="relative"
      h={["200px", "500px"]}
      bg="gray.800"
      marginX="5px"
      flex="0 0 100%"
      overflow="hidden"
    >
      <Flex h="full" align="center" justify="center">
        {ext === "mp4" ? (
          <Video src={uri} frame={INFLUENCE_FRAME} />
        ) : (
          <>
            <Spinner color="whiteAlpha.400" />
            <Image
              src={uri}
              alt={alt}
              style={{
                objectFit: "cover",
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
              fill
            />
          </>
        )}
      </Flex>
    </Card>
  );
};
