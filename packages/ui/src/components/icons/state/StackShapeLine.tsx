import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const StackShapeLineIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.31 7.882v9.083h5.885a.8.8 0 0 0 .437-.13l6.637-4.32V7.882H5.31Zm-.2-1.2a1 1 0 0 0-1 1v9.483a1 1 0 0 0 1 1h6.085a2 2 0 0 0 1.092-.324l6.728-4.38a1 1 0 0 0 .454-.838V7.682a1 1 0 0 0-1-1H5.11Z"
      clipRule="evenodd"
    />
  </Icon>
));
