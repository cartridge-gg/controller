import { memo } from "react";
import { Icon, IconProps } from "@chakra-ui/react";

export const DisconnectSolidIcon = memo((props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M18 1.608a.5.5 0 0 0-.683.183L14.309 7H9v-.5A1.5 1.5 0 0 0 7.5 5h-3A1.5 1.5 0 0 0 3 6.5v3A1.5 1.5 0 0 0 4.5 11h3l2.51 3.344a1.243 1.243 0 0 0-.01.12l-3.183 5.513a.5.5 0 0 0 .866.5l10.5-18.186A.5.5 0 0 0 18 1.608Zm-6.87 10.899L13.155 9H9v.5c0 .053-.003.106-.01.156l2.14 2.85Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      d="m13.155 13-2.992 5.181A1.5 1.5 0 0 0 11.5 19h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-1.345Zm4.618-8-2.75 4.764A1.501 1.501 0 0 0 16.5 11h3A1.5 1.5 0 0 0 21 9.5v-3A1.5 1.5 0 0 0 19.5 5h-1.727Z"
    />
  </Icon>
));
