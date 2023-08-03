import { Text } from "@chakra-ui/react";
import { HeaderItem } from "../HeaderItem";
import { StarknetIcon } from "../icons";

const Chain = ({ name }: { name: string }) => {
  return (
    <HeaderItem>
      <StarknetIcon />
      <Text textTransform="uppercase" fontWeight="700" letterSpacing="0.05em">
        {name}
      </Text>
    </HeaderItem>
  );
};

export default Chain;
