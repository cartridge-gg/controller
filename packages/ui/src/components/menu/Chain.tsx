import { Image, Text } from "@chakra-ui/react";
import { HeaderItem } from "../HeaderItem";
import StarknetGray from "../icons/StarknetGray";

const Chain = ({ name }: { name: string }) => {
  return (
    <HeaderItem>
      <StarknetGray boxSize="14px" />
      <Text textTransform="uppercase" fontWeight="700" letterSpacing="0.05em">
        {name}
      </Text>
    </HeaderItem>
  );
};

export default Chain;
