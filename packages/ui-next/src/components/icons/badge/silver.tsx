import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const SilverIcon = memo(
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
          d="M21.404 2.20945C22.899 0.935393 25.0979 0.935392 26.5929 2.20945L29.6402 4.80632C31.0205 5.21126 32.3388 5.76102 33.5776 6.43805L37.571 6.75673C39.5291 6.91299 41.0839 8.46783 41.2402 10.4259L41.5586 14.4163C42.2373 15.6571 42.7884 16.9778 43.194 18.3607L45.7875 21.404C47.0615 22.899 47.0615 25.0979 45.7875 26.5929L43.1954 29.6346C42.7896 31.0194 42.238 32.3418 41.5583 33.5843L41.2402 37.571C41.0839 39.5291 39.5291 41.0839 37.571 41.2402L33.5842 41.5583C32.3418 42.2379 31.0194 42.7895 29.6347 43.1953L26.5929 45.7875C25.0979 47.0615 22.899 47.0615 21.404 45.7875L18.3606 43.1939C16.9778 42.7883 15.6572 42.2373 14.4164 41.5586L10.4259 41.2402C8.46783 41.0839 6.91299 39.5291 6.75673 37.571L6.43805 33.5775C5.76103 32.3387 5.21127 31.0204 4.80634 29.6402L2.20945 26.5929C0.935393 25.0979 0.935392 22.899 2.20945 21.404L4.80773 18.3551C5.21247 16.9768 5.76165 15.6602 6.43776 14.423L6.75673 10.4259C6.91299 8.46783 8.46783 6.91299 10.4259 6.75673L14.423 6.43776C15.6602 5.76165 16.9767 5.21248 18.355 4.80774L21.404 2.20945ZM43 24C43 34.4934 34.4934 43 24 43C13.5066 43 5 34.4934 5 24C5 13.5066 13.5066 5 24 5C34.4934 5 43 13.5066 43 24Z"
          fill="url(#paint0_linear_10143_96690)"
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
          fill="url(#paint1_linear_10143_96690)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_10143_96690"
            x1="1.22924"
            y1="23.991"
            x2="46.7528"
            y2="23.991"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FFF8C1" />
            <stop offset="0.0001" stop-color="#C2E8FD" />
            <stop offset="0.3123" stop-color="#919191" />
            <stop offset="0.7592" stop-color="#DDDDDD" />
            <stop offset="1" stop-color="white" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10143_96690"
            x1="3"
            y1="13.5"
            x2="47.5"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FFF8C1" />
            <stop offset="0.0001" stop-color="#C2E8FD" />
            <stop offset="0.3123" stop-color="#919191" />
            <stop offset="0.7592" stop-color="#DDDDDD" />
            <stop offset="1" stop-color="white" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

SilverIcon.displayName = "SilverIcon";
