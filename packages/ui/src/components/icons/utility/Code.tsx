import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const CodeUtilIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="m13.614 4.74-.209.652-4.113 12.796-.208.651 1.305.42.209-.651L14.71 5.812l.208-.651-1.305-.42Zm1.76 3.865.5.469L18.993 12l-3.12 2.928-.5.468.936 1 .5-.468 3.656-3.428.534-.5-.534-.5-3.656-3.427-.5-.468-.937 1Zm-7.684-1-.5.469L3.534 11.5l-.534.5.534.5L7.19 15.93l.5.468.937-1-.5-.468L5.005 12l3.122-2.927.5-.469-.937-1Z"
    />
  </Icon>
));
