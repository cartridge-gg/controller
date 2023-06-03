import { ReactNode } from "react";
import {
  Box,
  Text,
  HStack,
  StyleProps,
  useBreakpointValue,
} from "@chakra-ui/react";
import CheckIcon from "@cartridge/ui/src/components/icons/Check";

export interface Step {
  name: string;
  icon?: ReactNode;
}

export interface StepsBarProps {
  steps: Step[];
  height?: string;
  width?: string;
  active?: number;
}

const Step = ({
  index,
  active,
  name,
  icon,
}: { index: number; active: number } & Step) => {
  const isMobile = useBreakpointValue([true, false]);
  const isActive = index === active;
  const bgColor = isActive ? "legacy.gray.600" : "legacy.gray.700";
  return (
    <HStack
      h="inherit"
      overflow="hidden"
      justify="space-between"
      spacing="-1px"
      flex={isActive && isMobile ? 4 : 1}
      _first={{
        borderRadius: "5px 0 0 5px",
        ">:first-of-type": {
          display: "none",
        },
      }}
      _last={{
        borderRadius: "0 5px 5px 0",
        ">:last-of-type": {
          display: "none",
        },
      }}
    >
      <Tail fill={bgColor} />
      <HStack
        h="full"
        w="full"
        justify="center"
        fontSize="9px"
        bgColor={bgColor}
        color={isActive ? "white" : "legacy.whiteAlpha.600"}
      >
        <Box fontSize="10px">{index < active ? <CheckIcon /> : icon}</Box>
        <Text
          color="inherit"
          variant="ibm-upper-bold"
          display={!isActive && isMobile ? "none" : "block"}
        >
          {name}
        </Text>
      </HStack>
      <Head fill={bgColor} />
    </HStack>
  );
};

export const StepsBar = ({
  steps,
  active = 0,
  height = "36px",
  width = "full",
  ...rest
}: StepsBarProps & StyleProps) => {
  return (
    <HStack h={height} w={width} justify="center" spacing="-3px" {...rest}>
      {steps.map((step, i) => {
        return (
          <Step
            key={i}
            index={i}
            name={step.name}
            icon={step.icon}
            active={active}
          />
        );
      })}
    </HStack>
  );
};

const Head = ({ fill }: { fill: string }) => connector(true, fill);
const Tail = ({ fill }: { fill: string }) => connector(false, fill);

function connector(isHead: boolean, fill: string) {
  return (
    <Box h="inherit" fill={fill}>
      <svg height="100%" viewBox="0 0 12 32" xmlns="http://www.w3.org/2000/svg">
        {isHead ? (
          <path d="M0 0H0.898195C2.36197 0 3.70884 0.799548 4.40978 2.08459L10.9552 14.0846C11.6065 15.2785 11.6065 16.7215 10.9552 17.9154L4.40978 29.9154C3.70884 31.2005 2.36197 32 0.898195 32H0V0Z" />
        ) : (
          <path d="M0.838272 1.49026C0.463308 0.823658 0.945021 0 1.70985 0H12V16V32H1.70985C0.945021 32 0.463307 31.1763 0.838272 30.5097L7.89691 17.961C8.58184 16.7434 8.58184 15.2566 7.89691 14.039L0.838272 1.49026Z" />
        )}
      </svg>
    </Box>
  );
}
