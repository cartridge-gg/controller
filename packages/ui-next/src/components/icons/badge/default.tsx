import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const DefaultIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 48 48"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.3782 2.26855C22.8821 0.967773 25.1126 0.967773 26.6165 2.26855L29.4993 4.76465L29.493 4.76378C37.8679 7.15074 44 14.8593 44 24C44 25.6745 43.7942 27.301 43.4065 28.8555L44.1282 32.6006C44.5032 34.5498 43.3899 36.4834 41.511 37.1357L37.8904 38.3895C34.2927 41.8631 29.3959 44 24 44C18.6017 44 13.7028 41.8612 10.1047 38.3848C10.1074 38.388 10.1087 38.3896 10.1087 38.3896L6.4876 37.1357C4.60869 36.4834 3.49151 34.5498 3.87041 32.6006L4.59271 28.8524L4.59407 28.8579C4.20601 27.3027 4 25.6754 4 24C4 14.8574 10.1345 7.14767 18.512 4.76235L18.4954 4.76465L21.3782 2.26855ZM43 24C43 34.4934 34.4934 43 24 43C13.5066 43 5 34.4934 5 24C5 13.5066 13.5066 5 24 5C34.4934 5 43 13.5066 43 24Z"
          fill="url(#paint0_linear_10143_96692)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 41C33.3888 41 41 33.3888 41 24C41 14.6112 33.3888 7 24 7C14.6112 7 7 14.6112 7 24C7 33.3888 14.6112 41 24 41ZM24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z"
          fill="#181C19"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44ZM42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z"
          fill="url(#paint1_linear_10143_96692)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_10143_96692"
            x1="4.17962"
            y1="27.0158"
            x2="43.81"
            y2="27.0158"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#404041" />
            <stop offset="0.3123" stop-color="#3B3B3D" />
            <stop offset="0.7592" stop-color="#2D2D2F" />
            <stop offset="1" stop-color="#434344" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10143_96692"
            x1="43.8204"
            y1="24"
            x2="4.17962"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#404041" />
            <stop offset="0.3123" stop-color="#3B3B3D" />
            <stop offset="0.7592" stop-color="#2D2D2F" />
            <stop offset="1" stop-color="#434344" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

DefaultIcon.displayName = "DefaultIcon";
