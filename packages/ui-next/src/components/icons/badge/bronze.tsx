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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.199 1.04805C23.2732 1.00118 22.3357 1.27852 21.5623 1.87227L17.2903 5.15332C14.9851 5.97407 12.8748 7.20575 11.0476 8.7602L6.05444 10.8254C4.37866 11.5207 3.37866 13.2512 3.61694 15.0441L4.32395 20.3955C4.11115 21.5647 4 22.7694 4 24C4 25.1321 4.09406 26.2422 4.27479 27.323C4.29054 27.4178 4.30694 27.5123 4.32397 27.6066L3.61694 32.9543C3.37866 34.7512 4.37866 36.4816 6.05444 37.177L11.0505 39.2434C12.8748 40.7941 14.9802 42.0246 17.2849 42.8449L21.5623 46.1301C22.9998 47.2316 24.9998 47.2316 26.4333 46.1301L30.7068 42.8488C33.0154 42.0285 35.1248 40.7981 36.9529 39.2434L41.9451 37.177C43.6208 36.4816 44.6169 34.7512 44.3826 32.9543L43.6756 27.6071C43.8887 26.437 44 25.2315 44 24C44 22.7688 43.8888 21.5636 43.6758 20.3939L44.3826 15.0481C44.6169 13.2512 43.6208 11.5207 41.9451 10.8254L36.9529 8.75899C35.7244 7.71423 34.3688 6.81588 32.9112 6.09003L32.9066 6.08774C32.1953 5.7334 31.46 5.42018 30.7037 5.15118L26.4333 1.87227C25.7732 1.36055 24.9919 1.08712 24.199 1.04805ZM24 5C34.4934 5 43 13.5066 43 24C43 34.4934 34.4934 43 24 43C13.5066 43 5 34.4934 5 24C5 13.5066 13.5066 5 24 5Z"
          fill="url(#paint0_linear_10143_96691)"
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
          fill="url(#paint1_linear_10143_96691)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_10143_96691"
            x1="4.38818"
            y1="23.9946"
            x2="43.6005"
            y2="23.9946"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#DDB5A4" />
            <stop offset="0.3123" stop-color="#7F5746" />
            <stop offset="0.7592" stop-color="#744C3B" />
            <stop offset="1" stop-color="#B18979" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_10143_96691"
            x1="43.2103"
            y1="24"
            x2="4.78967"
            y2="24"
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
