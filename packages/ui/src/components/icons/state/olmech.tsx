import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const OlmechIcon = memo(
  forwardRef<
    SVGSVGElement,
    Omit<StateIconProps, "variant"> & {
      variant:
        | "one"
        | "two"
        | "three"
        | "four"
        | "five"
        | "six"
        | "seven"
        | "eight";
    }
  >(({ className, size, variant, ...props }, forwardedRef) => (
    <svg
      viewBox="0 0 24 24"
      className={iconVariants({ size, className })}
      ref={forwardedRef}
      {...props}
    >
      {(() => {
        switch (variant) {
          case "one":
            return (
              <>
                <path
                  d="M10 4H8V6H6V8H8V10H10V12H14V10H16V8H18V6H16V4H14V6H16V8H14V10H10V8H8V6H10V4Z"
                  className="fill-current"
                />
                <path d="M18 12H20V16H18V12Z" className="fill-current" />
                <path
                  d="M16 14H14V16H10V14H8V16H10V20H14V16H16V14Z"
                  className="fill-current"
                />
                <path d="M6 16V12H4V16H6Z" className="fill-current" />
              </>
            );
          case "two":
            return (
              <>
                <path
                  d="M4 4V6H6V8H4V12H6V8H8V10H10V12H14V10H16V8H18V12H20V8H18V6H20V4H16V8H14V10H10V8H8V4H4Z"
                  className="fill-current"
                />
                <path d="M8 14H6V16H8V14Z" className="fill-current" />
                <path d="M8 18H10V20H8V18Z" className="fill-current" />
                <path d="M18 14H16V16H18V14Z" className="fill-current" />
                <path d="M16 18H14V20H16V18Z" className="fill-current" />
              </>
            );
          case "three":
            return (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 4H4V8H10V10H4V14H6V18H4V20H6V18H8V20H16V18H18V20H20V18H18V14H20V10H14V8H20V4H18V6H14V8H10V6H6V4ZM14 14V12H10V14H14Z"
                className="fill-current"
              />
            );
          case "four":
            return (
              <>
                <path d="M6 4H4V6H6V4Z" className="fill-current" />
                <path
                  d="M6 8H4V14H6V20H8V18H10V16H8V14H6V8Z"
                  className="fill-current"
                />
                <path d="M8 4H16V8H8V4Z" className="fill-current" />
                <path d="M18 4H20V6H18V4Z" className="fill-current" />
                <path d="M18 8H20V14H18V8Z" className="fill-current" />
                <path
                  d="M18 14V20H16V18H14V16H16V14H18Z"
                  className="fill-current"
                />
              </>
            );
          case "five":
            return (
              <>
                <path
                  d="M8 4V6H6V8H8V6H16V8H18V6H16V4H8Z"
                  className="fill-current"
                />
                <path d="M10 8V10H14V8H10Z" className="fill-current" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 20V18H8V20H4V12H20V20H16V18H14V20H10ZM6 14H18V16H6V14Z"
                  className="fill-current"
                />
              </>
            );
          case "six":
            return (
              <>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 4H6V6H4V10H6V18H4V20H6V18H18V20H20V18H18V10H20V6H18V4H16V6H8V4ZM10 10V12H14V10H10ZM18 10V8H16V10H18ZM6 10V8H8V10H6Z"
                  className="fill-current"
                />
              </>
            );
          case "seven":
            return (
              <>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6 4H18V8H20V12H16V16H14V14H10V16H8V12H4V8H6V4ZM16 10V6H8V10H16Z"
                  className="fill-current"
                />
                <path d="M10 18H8V20H10V18Z" className="fill-current" />
                <path d="M4 14V20H6V14H4Z" className="fill-current" />
                <path d="M14 18H16V20H14V18Z" className="fill-current" />
                <path d="M18 14H20V20H18V14Z" className="fill-current" />
              </>
            );
          case "eight":
            return (
              <>
                <path d="M6 4H4V8H8V6H6V4Z" className="fill-current" />
                <path d="M8 10V12H4V10H8Z" className="fill-current" />
                <path
                  d="M10 12H8V14H6V20H8V14H10V12Z"
                  className="fill-current"
                />
                <path
                  d="M10 8V12H14V14H16V20H18V14H16V12H20V10H16V12H14V8H10Z"
                  className="fill-current"
                />
                <path d="M10 16V18H14V16H10Z" className="fill-current" />
                <path d="M18 4H20V8H16V6H18V4Z" className="fill-current" />
              </>
            );
        }
      })()}
    </svg>
  )),
);

OlmechIcon.displayName = "OlmechIcon";

<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
></svg>;
