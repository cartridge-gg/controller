import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const ArrowFromLineDownIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M5.143 5.721v-1.72h13.714v1.72H5.143Zm7.482 13.613L12 20l-5.782-6.143 1.25-1.175.586.625 3.089 3.282v-8.41h1.714v8.41l3.679-3.907 1.25 1.175-.586.625-4.571 4.857-.004-.004Z"
    />
  </Icon>
));
