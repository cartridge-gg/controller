import { useState, useEffect, useCallback } from "react";
import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import useEmblaCarousel from "embla-carousel-react";

import { DotBtn, NavBtn } from ".";
import { Slide } from "./Slide";
import Thumb from "./Thumb";

export const Carousel = ({
  media,
}: {
  media: { uri: string; alt: string }[];
}) => {
  const [viewportRef, embla] = useEmblaCarousel();
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);
  const scrollTo = useCallback(
    (index: number) => embla && embla.scrollTo(index),
    [embla],
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
    setPrevBtnEnabled(embla.canScrollPrev());
    setNextBtnEnabled(embla.canScrollNext());
  }, [embla, setSelectedIndex]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    setScrollSnaps(embla.scrollSnapList() as any);
    embla.on("select", onSelect);
  }, [embla, setScrollSnaps, onSelect]);
  return (
    <>
      <Box overflow="hidden" ref={viewportRef} position="relative">
        <Flex>
          {media.map((file) => (
            <Slide key={file.uri} {...file}></Slide>
          ))}
        </Flex>
        <NavBtn isNext={true} onClick={scrollNext} disabled={!nextBtnEnabled} />
        <NavBtn
          isNext={false}
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
        />
      </Box>
      <Flex
        h="10px"
        w="full"
        gap="10px"
        my={["10px", "25px"]}
        align="center"
        justify="center"
        display={scrollSnaps.length > 1 ? "flex" : "none"}
      >
        {scrollSnaps.map((_, index) => (
          <DotBtn
            key={index}
            active={index === selectedIndex}
            diff={Math.abs(selectedIndex - index)}
            onClick={() => scrollTo(index)}
          />
        ))}
      </Flex>

      <SimpleGrid columns={[2, 5]} spacing={["10px", "13px"]}>
        {media.map((file, index) => (
          <Thumb
            onClick={() => scrollTo(index)}
            selected={index === selectedIndex}
            uri={file.uri}
            alt={file.alt}
            key={index}
          />
        ))}
      </SimpleGrid>
    </>
  );
};
