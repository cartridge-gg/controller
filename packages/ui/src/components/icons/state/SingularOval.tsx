import { memo } from "react";
import { Icon } from "@chakra-ui/react";
import { StateIconProps } from "./types";

export const SingularOvalIcon = memo(
  ({ variant = "solid", ...props }: StateIconProps) => (
    <Icon viewBox="0 0 24 24" {...props}>
      {(() => {
        switch (variant) {
          case "solid":
            return (
              <ellipse
                cx="12"
                cy="12"
                fill="currentColor"
                rx="7.675"
                ry="6.5"
              />
            );
          case "line":
            return (
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M12 17.3c3.77 0 6.475-2.552 6.475-5.3 0-2.748-2.704-5.3-6.475-5.3-3.77 0-6.475 2.552-6.475 5.3 0 2.748 2.704 5.3 6.475 5.3Zm0 1.2c4.239 0 7.675-2.91 7.675-6.5S16.24 5.5 12 5.5 4.325 8.41 4.325 12 7.761 18.5 12 18.5Z"
                clipRule="evenodd"
              />
            );
        }
      })()}
    </Icon>
  ),
);
