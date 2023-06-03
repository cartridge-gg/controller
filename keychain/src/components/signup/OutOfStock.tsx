import { Flex, Text, Link, HStack } from "@chakra-ui/react";
import NextLink from "next/link";
import SparkleIcon from "@cartridge/ui/src/components/icons/Sparkle";
export const OutOfStock = () => {
  return (
    <>
      <Flex
        py="28px"
        gap="20px"
        bgColor="legacy.gray.700"
        direction="column"
        borderRadius="8px"
        align="center"
        justify="center"
      >
        <SparkleIcon boxSize="27px" />
        <Text fontSize="13px">Starterpack has been minted out</Text>
      </Flex>
      <HStack as="strong" justify="center" fontSize="13px" mt="24px">
        <Text color="legacy.whiteAlpha.600">Already have a controller?</Text>
        <NextLink href="/login">
          <Link variant="traditional">Log In</Link>
        </NextLink>
      </HStack>
    </>
  );
};
