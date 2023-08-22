import { useState, useEffect, useCallback } from "react";
import { Text, Flex, VStack, HStack, Spacer } from "@chakra-ui/react";
import useEmblaCarousel from "embla-carousel-react";
import { Next, Prev, Dot } from "components/carousel/Buttons";
import { EdgeFade } from "components/carousel/EdgeFade";
import { StarterItemProps } from "components/Auth/StarterPack";

export function StarterPackCarousel({
  nonfungibles,
}: {
  nonfungibles: StarterItemProps[];
}) {
  const [viewportRef, embla] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
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
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    setScrollSnaps(embla.scrollSnapList() as any);
    embla.on("select", onSelect);
  }, [embla, setScrollSnaps, onSelect]);

  return (
    <>
      <Flex
        p="18px"
        w="full"
        gap="12px"
        overflow="hidden"
        direction="column"
        bg="solid.primary"
        position="relative"
        ref={viewportRef}
        borderRadius="0 0 8px 8px"
      >
        <Flex w="95%">
          {nonfungibles.map((item, index) => (
            <HStack
              key={index}
              minWidth="full"
              gap={5}
              pr={5}
              userSelect="none"
              align="flex-start"
            >
              <Flex
                align="center"
                justify="center"
                minWidth="70px"
                minHeight="70px"
                borderRadius="sm"
                bg="solid.primary"
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor={selectedIndex == index ? "green.100" : "gray.400"}
                transition="border-color 0.5s ease"
              >
                {item.icon}
              </Flex>
              <VStack boxSize="full" align="flex-start">
                <HStack w="full" fontWeight="bold" textTransform="uppercase">
                  <Text fontSize="sm">{item.name}</Text>
                </HStack>
                <Text fontSize="sm" color="text.secondary">
                  {item.description}
                </Text>
              </VStack>
            </HStack>
          ))}
        </Flex>
        <Spacer minHeight="10px" />

        <EdgeFade percentage={3} />

        <HStack w="full" pointerEvents="none" align="flex-end" zIndex="1">
          <HStack w="full" justify="space-between">
            <Prev onClick={scrollPrev} enabled={prevBtnEnabled} />

            <Flex
              h={2.5}
              w="full"
              gap={2.5}
              my={["10px", "25px"]}
              align="center"
              justify="center"
              display={scrollSnaps.length > 1 ? "flex" : "none"}
            >
              {scrollSnaps.map((_, index) => (
                <Dot
                  key={index}
                  size={3}
                  active={index === selectedIndex}
                  diff={Math.abs(selectedIndex - index)}
                  onClick={() => scrollTo(index)}
                />
              ))}
            </Flex>

            <Next onClick={scrollNext} enabled={nextBtnEnabled} />
          </HStack>
        </HStack>
      </Flex>
      <Spacer minHeight={2.5} />
      <VStack
        w="full"
        px={3}
        spacing={2.5}
        align="flex-start"
        textTransform="uppercase"
      >
        {nonfungibles.map((item, index) => (
          <HStack
            key={index}
            w="full"
            fontSize="2xs"
            transition="color 0.5s ease"
            onClick={() => scrollTo(index)}
            color={selectedIndex === index ? "white" : "translucent.lg"}
            _hover={{ cursor: selectedIndex === index ? "default" : "pointer" }}
          >
            {/** TODO: icon <ChevronPixelIcon
              fill={selectedIndex === index ? "white" : "transparent"}
        /> */}
            <Text color="inherit">{item.name}</Text>
            <Spacer />
            <Text color="inherit">FREE</Text>
          </HStack>
        ))}
      </VStack>
    </>
  );
}
