import {
  TabList,
  Tabs as ChakraTabs,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { BoltIcon, DetailsIcon, StackShapeIcon } from "src/components";

const meta: Meta<typeof Tabs> = {
  title: "Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Example: Story = {
  args: {},
};

function Tabs() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onChange = useCallback((i: number) => {
    setActiveIndex(i);
  }, []);

  return (
    <ChakraTabs index={activeIndex} onChange={onChange}>
      <TabList>
        <Tab>
          <DetailsIcon
            boxSize={5}
            mr={2}
            variant={activeIndex === 0 ? "solid" : "line"}
          />
          Details
        </Tab>

        <Tab>
          <BoltIcon
            boxSize={5}
            mr={2}
            variant={activeIndex === 1 ? "solid" : "line"}
          />
          Details
          <Badge ml={2} variant="tab">
            100
          </Badge>
        </Tab>

        <Tab>
          <StackShapeIcon
            boxSize={5}
            mr={2}
            variant={activeIndex === 2 ? "solid" : "line"}
          />
          Details
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>Details</TabPanel>
        <TabPanel>Transaction</TabPanel>
        <TabPanel>State</TabPanel>
      </TabPanels>
    </ChakraTabs>
  );
}
