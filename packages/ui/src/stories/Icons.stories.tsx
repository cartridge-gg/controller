import type { Meta } from "@storybook/react";

import Fingerprint from "../components/icons/Fingerprint";

const meta: Meta<typeof Fingerprint> = {
  title: "Icons",
  component: Icons,
};

function Icons(props: typeof Fingerprint) {
  return (
    <>
      <Fingerprint {...props} m={1} />
      <Fingerprint {...props} m={1} />
      <Fingerprint {...props} m={1} />
    </>
  );
}

export default meta;

export const List = {
  args: {
    // children: "Press me",
    // variant: "yellow",
  },
};
