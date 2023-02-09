import { Image, Text } from "@chakra-ui/react";
import { HeaderItem } from "@cartridge/ui/src/components/HeaderItem";

const Chain = ({ name }: { name: string; }) => {
  return (
    <HeaderItem>
      <Image
        w="14px"
        h="14px"
        src="https://static.cartridge.gg/starknet-logo.png"
        filter="saturate(0) invert(100%);"
        alt="Chain icon"
      />
      <Text textTransform="uppercase" fontWeight="700">{name}</Text>
    </HeaderItem>
  );
};

export default Chain;
