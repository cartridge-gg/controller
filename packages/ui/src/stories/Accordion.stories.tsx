import { Meta, StoryObj } from "@storybook/react";
import {
  Accordion as ChakraAccordion,
  AccordionItem,
  AccordionButton,
  HStack,
  Text,
  Spacer,
  Box,
  AccordionPanel,
} from "@chakra-ui/react";
import {
  AlertIcon,
  InfoIcon,
  WarningIcon,
  WedgeDownIcon,
} from "src/components";
import { motion } from "framer-motion";

const meta: Meta<typeof Accordion> = {
  title: "Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    title: "Insufficient funds",
    description:
      "Your controller does not have enough gas to complete this transaction",
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {},
};

export const Info: Story = {
  args: {
    variant: "info",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
  },
};

function Accordion({
  variant,
  isExpanded,
  title,
  description,
}: {
  variant: string;
  isExpanded?: boolean;
  title: string;
  description?: string;
}) {
  return (
    <ChakraAccordion
      as={motion.div}
      w="full"
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      allowToggle={!isExpanded}
      defaultIndex={isExpanded ? [0] : undefined}
      variant={variant}
      color="solid.bg"
      fontSize="sm"
    >
      <AccordionItem position="relative">
        {({ isExpanded: itemExpanded }) => (
          <>
            <AccordionButton disabled={!description || isExpanded}>
              <HStack>
                {(() => {
                  switch (variant) {
                    case "info":
                      return <InfoIcon color="info.foreground" />;
                    case "warning":
                      return <WarningIcon />;
                    case "error":
                      return <AlertIcon color="error.foreground" />;
                  }
                })()}
                <Text
                  as="b"
                  fontSize="2xs"
                  color="inherit"
                  textTransform="uppercase"
                >
                  {title}
                </Text>
              </HStack>

              <Spacer />

              {description && !isExpanded && (
                <Box
                  as={motion.div}
                  animate={{
                    rotate: itemExpanded ? 180 : 0,
                  }}
                >
                  <WedgeDownIcon boxSize={5} />
                </Box>
              )}
            </AccordionButton>

            {description && (
              <AccordionPanel maxH={200}>{description}</AccordionPanel>
            )}
          </>
        )}
      </AccordionItem>
    </ChakraAccordion>
  );
}
