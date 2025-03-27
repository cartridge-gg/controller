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
          d="M21.5637 1.87094C23.0005 0.767556 24.9995 0.767559 26.4363 1.87095L33.1811 7.0506C33.4591 7.26415 33.7641 7.44021 34.0881 7.57426L41.9462 10.8256C43.6201 11.5182 44.6196 13.2494 44.3825 15.0454L43.2691 23.4763C43.2233 23.8239 43.2233 24.1761 43.2691 24.5237L44.3825 32.9546C44.6196 34.7506 43.6201 36.4818 41.9462 37.1744L34.0881 40.4257C33.7641 40.5598 33.4591 40.7359 33.1811 40.9494L26.4363 46.1291C24.9995 47.2324 23.0005 47.2324 21.5637 46.1291L14.8189 40.9494C14.5408 40.7359 14.2359 40.5598 13.9119 40.4257L6.05382 37.1744C4.37987 36.4818 3.38037 34.7506 3.61753 32.9546L4.73085 24.5237C4.77675 24.1761 4.77675 23.8239 4.73085 23.4763L3.61753 15.0454C3.38037 13.2494 4.37986 11.5182 6.05382 10.8256L13.9119 7.57426C14.2359 7.44021 14.5408 7.26415 14.8189 7.0506L21.5637 1.87094Z"
          fill="url(#paint0_linear_10111_105945)"
        />
        <g filter="url(#filter0_d_10111_105945)">
          <path
            d="M24 44C35.0458 44 44.0001 35.0457 44.0001 24C44.0001 12.9543 35.0458 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
            fill="url(#paint1_linear_10111_105945)"
          />
        </g>
        <path
          d="M24 42C33.9412 42 42.0001 33.9411 42.0001 24C42.0001 14.0589 33.9412 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z"
          fill="#161A17"
        />
        <path
          d="M41 23.9402C41 24.6369 40.9601 25.3336 40.8804 26.0105C40.8007 26.7669 40.6413 27.5233 40.4619 28.24C40.3822 28.5585 40.3025 28.857 40.2028 29.1755C40.0235 29.7329 39.8242 30.2903 39.585 30.8278C39.0668 32.0022 38.4291 33.0971 37.6718 34.1123C37.034 34.9682 36.3166 35.7645 35.5194 36.501C32.51 39.2879 28.4842 40.9799 24.0599 40.9998C19.6355 41.0197 15.5898 39.3476 12.5605 36.5806C11.7833 35.864 11.0658 35.0877 10.428 34.2516C9.23227 32.679 8.31551 30.8875 7.73755 28.9765C7.45854 28.0807 7.25924 27.1451 7.13966 26.1896C7.05995 25.4929 7.00016 24.7962 7.00016 24.0995C6.9603 14.6639 14.5335 7.03985 23.9403 7.00004C33.3271 6.98013 40.9601 14.5445 41 23.9402Z"
          fill="url(#pattern0_10111_105945)"
        />
        <defs>
          <filter
            id="filter0_d_10111_105945"
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
              result="effect1_dropShadow_10111_105945"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_10111_105945"
              result="shape"
            />
          </filter>
          <pattern
            id="pattern0_10111_105945"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          ></pattern>
          <linearGradient
            id="paint0_linear_10111_105945"
            x1="-0.0260304"
            y1="23.9921"
            x2="48.0103"
            y2="23.9921"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#DDB5A4" />
            <stop offset="0.3123" stop-color="#7F5746" />
            <stop offset="0.7592" stop-color="#744C3B" />
            <stop offset="1" stop-color="#B18979" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10111_105945"
            x1="3.97831"
            y1="23.9934"
            x2="44.0087"
            y2="23.9934"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#DDB5A4" />
            <stop offset="0.3123" stop-color="#7F5746" />
            <stop offset="0.7592" stop-color="#744C3B" />
            <stop offset="1" stop-color="#B18979" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

BronzeIcon.displayName = "BronzeIcon";
