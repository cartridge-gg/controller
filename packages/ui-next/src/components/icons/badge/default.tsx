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
          d="M21.3814 2.26779C22.8845 0.966077 25.1155 0.966075 26.6186 2.26779L39.5802 13.4929C40.2588 14.0805 40.7199 14.8793 40.8895 15.7607L44.13 32.5983C44.5057 34.5509 43.3902 36.483 41.5113 37.1339L25.3093 42.7464C24.4612 43.0402 23.5388 43.0402 22.6907 42.7464L6.48866 37.1339C4.6098 36.483 3.49427 34.5509 3.87004 32.5983L7.11045 15.7607C7.28008 14.8793 7.74124 14.0805 8.41976 13.4929L21.3814 2.26779Z"
          fill="url(#paint0_linear_10111_105946)"
        />
        <g filter="url(#filter0_d_10111_105946)">
          <path
            d="M24 44C35.0458 44 44.0001 35.0457 44.0001 24C44.0001 12.9543 35.0458 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
            fill="url(#paint1_linear_10111_105946)"
          />
          <path
            d="M24 42C33.9412 42 42.0001 33.9411 42.0001 24C42.0001 14.0589 33.9412 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z"
            fill="#161A17"
          />
        </g>
        <path
          d="M41 23.9402C41 24.6369 40.9601 25.3336 40.8804 26.0104C40.8007 26.7669 40.6413 27.5233 40.4619 28.2399C40.3822 28.5584 40.3025 28.857 40.2028 29.1755C40.0235 29.7329 39.8242 30.2903 39.585 30.8277C39.0668 32.0022 38.4291 33.097 37.6718 34.1122C37.034 34.9682 36.3166 35.7644 35.5194 36.501C32.51 39.2878 28.4842 40.9799 24.0599 40.9998C19.6355 41.0197 15.5898 39.3476 12.5605 36.5806C11.7833 35.864 11.0658 35.0876 10.428 34.2516C9.23227 32.679 8.31551 30.8874 7.73755 28.9764C7.45854 28.0807 7.25924 27.1451 7.13966 26.1896C7.05995 25.4929 7.00016 24.7962 7.00016 24.0994C6.9603 14.6639 14.5335 7.03985 23.9403 7.00004C33.3271 6.98013 40.9601 14.5445 41 23.9402Z"
          fill="url(#pattern0_10111_105946)"
        />
        <defs>
          <filter
            id="filter0_d_10111_105946"
            x="0"
            y="1"
            width="48"
            height="48"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="2" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.00392157 0 0 0 0 0.0196078 0 0 0 0 0.2 0 0 0 0.08 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_10111_105946"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_10111_105946"
              result="shape"
            />
          </filter>
          <pattern
            id="pattern0_10111_105946"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          ></pattern>
          <linearGradient
            id="paint0_linear_10111_105946"
            x1="-0.0260304"
            y1="23.9921"
            x2="48.0103"
            y2="23.9921"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#404041" />
            <stop offset="0.3123" stop-color="#3B3B3D" />
            <stop offset="0.7592" stop-color="#2D2D2F" />
            <stop offset="1" stop-color="#434344" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10111_105946"
            x1="3.97831"
            y1="23.9934"
            x2="44.0087"
            y2="23.9934"
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
