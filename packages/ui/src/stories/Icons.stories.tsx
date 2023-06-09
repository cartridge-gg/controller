import type { Meta } from "@storybook/react";
import { Flex } from "@chakra-ui/react";
import Fingerprint from "../components/icons/Fingerprint";

const meta: Meta<typeof Fingerprint> = {
  title: "Icon",
  component: Icons,
};

function Icons(props: typeof Fingerprint) {
  return (
    <Flex>
      <Fingerprint m={1} {...props} />
    </Flex>
  );
}

export default meta;

export const All = {
  args: {},
};
