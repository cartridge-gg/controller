import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const BronzeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 48 48"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M21.7727 3.75862C22.4802 3.21548 23.3378 2.96177 24.1847 3.00465C24.91 3.04039 25.6247 3.29052 26.2286 3.75862L28.5638 5.55168C27.1019 5.19122 25.5733 5 24 5C22.4277 5 20.9001 5.19097 19.439 5.55098L21.7727 3.75862Z"
          className="fill-current"
        />
        <path
          d="M10.3141 10.8205L7.58663 11.9487C6.05368 12.5847 5.13891 14.1677 5.35688 15.8078L5.74214 18.7239C6.6098 15.716 8.20061 13.0148 10.3141 10.8205Z"
          className="fill-current"
        />
        <path
          d="M5.74227 29.2766L5.35688 32.1915C5.13891 33.8352 6.05368 35.4182 7.58663 36.0542L10.3187 37.1842C8.20302 34.9893 6.61058 32.2864 5.74227 29.2766Z"
          className="fill-current"
        />
        <path
          d="M19.4335 42.4477L21.7727 44.2442C23.0877 45.2519 24.9172 45.2519 26.2286 44.2442L28.5693 42.447C27.1057 42.8083 25.5752 43 24 43C22.4258 43 20.8963 42.8086 19.4335 42.4477Z"
          className="fill-current"
        />
        <path
          d="M37.6766 37.189L40.4182 36.0542C41.9512 35.4182 42.8624 33.8352 42.648 32.1915L42.2611 29.265C41.3929 32.2817 39.7974 34.9904 37.6766 37.189Z"
          className="fill-current"
        />
        <path
          d="M42.2613 18.7359L42.648 15.8114C42.8624 14.1677 41.9512 12.5847 40.4182 11.9487L37.6812 10.8157C39.7999 13.0137 41.3938 15.721 42.2613 18.7359Z"
          className="fill-current"
        />
        <path
          d="M21.7727 3.75862C22.4802 3.21548 23.3378 2.96177 24.1847 3.00465C24.91 3.04039 25.6247 3.29052 26.2286 3.75862L28.5638 5.55168C27.1019 5.19122 25.5733 5 24 5C22.4277 5 20.9001 5.19097 19.439 5.55098L21.7727 3.75862Z"
          fill="url(#paint0_linear_10556_64337)"
        />
        <path
          d="M10.3141 10.8205L7.58663 11.9487C6.05368 12.5847 5.13891 14.1677 5.35688 15.8078L5.74214 18.7239C6.6098 15.716 8.20061 13.0148 10.3141 10.8205Z"
          fill="url(#paint1_linear_10556_64337)"
        />
        <path
          d="M5.74227 29.2766L5.35688 32.1915C5.13891 33.8352 6.05368 35.4182 7.58663 36.0542L10.3187 37.1842C8.20302 34.9893 6.61058 32.2864 5.74227 29.2766Z"
          fill="url(#paint2_linear_10556_64337)"
        />
        <path
          d="M19.4335 42.4477L21.7727 44.2442C23.0877 45.2519 24.9172 45.2519 26.2286 44.2442L28.5693 42.447C27.1057 42.8083 25.5752 43 24 43C22.4258 43 20.8963 42.8086 19.4335 42.4477Z"
          fill="url(#paint3_linear_10556_64337)"
        />
        <path
          d="M37.6766 37.189L40.4182 36.0542C41.9512 35.4182 42.8624 33.8352 42.648 32.1915L42.2611 29.265C41.3929 32.2817 39.7974 34.9904 37.6766 37.189Z"
          fill="url(#paint4_linear_10556_64337)"
        />
        <path
          d="M42.2613 18.7359L42.648 15.8114C42.8624 14.1677 41.9512 12.5847 40.4182 11.9487L37.6812 10.8157C39.7999 13.0137 41.3938 15.721 42.2613 18.7359Z"
          fill="url(#paint5_linear_10556_64337)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5 24C5 34.4934 13.5066 43 24 43C34.4934 43 43 34.4934 43 24C43 13.5066 34.4934 5 24 5C13.5066 5 5 13.5066 5 24ZM7 24C7 33.3888 14.6112 41 24 41C33.3888 41 41 33.3888 41 24C41 14.6112 33.3888 7 24 7C14.6112 7 7 14.6112 7 24Z"
          className="fill-current"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 41C14.6112 41 7 33.3888 7 24C7 14.6112 14.6112 7 24 7C33.3888 7 41 14.6112 41 24C41 33.3888 33.3888 41 24 41ZM24 8C15.1634 8 8 15.1634 8 24C8 32.8366 15.1634 40 24 40C32.8366 40 40 32.8366 40 24C40 15.1634 32.8366 8 24 8Z"
          fill="black"
        />
        <defs>
          <linearGradient
            id="paint0_linear_10556_64337"
            x1="24.002"
            y1="-23.6614"
            x2="24.002"
            y2="42.438"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#161A17" stopOpacity="0" />
            <stop offset="1" stopColor="#161A17" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10556_64337"
            x1="24.002"
            y1="-23.6614"
            x2="24.002"
            y2="42.438"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#161A17" stopOpacity="0" />
            <stop offset="1" stopColor="#161A17" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_10556_64337"
            x1="24.002"
            y1="-23.6614"
            x2="24.002"
            y2="42.438"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#161A17" stopOpacity="0" />
            <stop offset="1" stopColor="#161A17" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_10556_64337"
            x1="24.002"
            y1="-23.6614"
            x2="24.002"
            y2="42.438"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#161A17" stopOpacity="0" />
            <stop offset="1" stopColor="#161A17" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_10556_64337"
            x1="24.002"
            y1="-23.6614"
            x2="24.002"
            y2="42.438"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#161A17" stopOpacity="0" />
            <stop offset="1" stopColor="#161A17" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_10556_64337"
            x1="24.002"
            y1="-23.6614"
            x2="24.002"
            y2="42.438"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#161A17" stopOpacity="0" />
            <stop offset="1" stopColor="#161A17" stopOpacity="0.24" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

BronzeIcon.displayName = "BronzeIcon";
