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
          d="M21.4055 2.21099C22.9006 0.936937 25.0994 0.936936 26.5945 2.21099L30.362 5.42165C31.0026 5.96761 31.7992 6.29756 32.6383 6.36452L37.5726 6.75828C39.5306 6.91453 41.0855 8.46937 41.2417 10.4274L41.6355 15.3617C41.7024 16.2008 42.0324 16.9974 42.5784 17.638L45.789 21.4055C47.0631 22.9006 47.0631 25.0994 45.789 26.5945L42.5784 30.362C42.0324 31.0026 41.7024 31.7992 41.6355 32.6383L41.2417 37.5726C41.0855 39.5306 39.5306 41.0855 37.5726 41.2417L32.6383 41.6355C31.7992 41.7024 31.0026 42.0324 30.362 42.5784L26.5945 45.789C25.0994 47.0631 22.9006 47.0631 21.4055 45.789L17.638 42.5784C16.9974 42.0324 16.2008 41.7024 15.3617 41.6355L10.4274 41.2417C8.46937 41.0855 6.91453 39.5306 6.75828 37.5726L6.36452 32.6383C6.29756 31.7992 5.96761 31.0026 5.42165 30.362L2.21099 26.5945C0.936937 25.0994 0.936936 22.9006 2.21099 21.4055L5.42165 17.638C5.96761 16.9974 6.29756 16.2008 6.36452 15.3617L6.75828 10.4274C6.91453 8.46937 8.46937 6.91453 10.4274 6.75828L15.3617 6.36452C16.2008 6.29756 16.9974 5.96761 17.638 5.42165L21.4055 2.21099Z"
          fill="url(#paint0_linear_10111_105944)"
        />
        <g filter="url(#filter0_d_10111_105944)">
          <path
            d="M24 44C35.0458 44 44.0001 35.0457 44.0001 24C44.0001 12.9543 35.0458 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
            fill="url(#paint1_linear_10111_105944)"
          />
          <path
            d="M24 42C33.9412 42 42.0001 33.9411 42.0001 24C42.0001 14.0589 33.9412 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z"
            fill="#161A17"
          />
        </g>
        <path
          d="M41 23.9402C41 24.6369 40.9601 25.3336 40.8804 26.0105C40.8007 26.7669 40.6413 27.5233 40.4619 28.24C40.3822 28.5585 40.3025 28.857 40.2028 29.1755C40.0235 29.7329 39.8242 30.2903 39.585 30.8278C39.0668 32.0022 38.4291 33.0971 37.6718 34.1123C37.034 34.9682 36.3166 35.7645 35.5194 36.501C32.51 39.2879 28.4842 40.9799 24.0599 40.9998C19.6355 41.0197 15.5898 39.3476 12.5605 36.5806C11.7833 35.864 11.0658 35.0877 10.428 34.2516C9.23227 32.679 8.31551 30.8875 7.73755 28.9765C7.45854 28.0807 7.25924 27.1451 7.13966 26.1896C7.05995 25.4929 7.00016 24.7962 7.00016 24.0995C6.9603 14.6639 14.5335 7.03985 23.9403 7.00004C33.3271 6.98013 40.9601 14.5445 41 23.9402Z"
          fill="url(#pattern0_10111_105944)"
        />
        <defs>
          <filter
            id="filter0_d_10111_105944"
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
              result="effect1_dropShadow_10111_105944"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_10111_105944"
              result="shape"
            />
          </filter>
          <pattern
            id="pattern0_10111_105944"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          ></pattern>
          <linearGradient
            id="paint0_linear_10111_105944"
            x1="-0.0260304"
            y1="23.9921"
            x2="48.0103"
            y2="23.9921"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FFF8C1" />
            <stop offset="0.0001" stop-color="#C2E8FD" />
            <stop offset="0.3123" stop-color="#919191" />
            <stop offset="0.7592" stop-color="#DDDDDD" />
            <stop offset="1" stop-color="#E3E3E3" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10111_105944"
            x1="3.97831"
            y1="23.9934"
            x2="44.0087"
            y2="23.9934"
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
