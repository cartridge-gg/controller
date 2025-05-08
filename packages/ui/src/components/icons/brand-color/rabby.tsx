import { forwardRef, memo } from "react";
import { IconProps } from "../types";
import { iconVariants } from "../utils";

export const RabbyColorIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M19.9182 13.4095C20.5467 11.9185 17.4399 7.75299 14.4719 6.01755C12.6011 4.67313 10.6518 4.85783 10.2569 5.44813C9.39048 6.74361 13.126 7.84133 15.6242 9.12229C15.0872 9.37 14.5811 9.81454 14.2835 10.383C13.3522 9.30315 11.308 8.37321 8.90928 9.12229C7.29287 9.62709 5.9495 10.8171 5.4303 12.6146C5.30414 12.555 5.16446 12.522 5.01751 12.522C4.45556 12.522 4 13.0058 4 13.6026C4 14.1994 4.45556 14.6832 5.01751 14.6832C5.12167 14.6832 5.44735 14.609 5.44735 14.609L10.6518 14.6491C8.57038 18.1558 6.92554 18.6684 6.92554 19.2759C6.92554 19.8834 8.49937 19.7188 9.09029 19.4924C11.9192 18.4083 14.9576 15.0298 15.4789 14.0572C17.6684 14.3473 19.5085 14.3816 19.9182 13.4095Z"
          fill="url(#paint0_linear_9302_60023)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.6238 9.12346C15.7396 9.07501 15.7213 8.89356 15.6895 8.75093C15.6164 8.42308 14.3554 7.10067 13.1714 6.50836C11.5579 5.70132 10.3699 5.74286 10.1942 6.11477C10.5228 6.83021 12.0465 7.50191 13.638 8.20345C14.3169 8.50273 15.0078 8.8076 15.6238 9.12346Z"
          fill="url(#paint1_linear_9302_60023)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5763 16.3219C13.25 16.1894 12.8814 16.0679 12.4624 15.9577C12.9092 15.1085 13.0029 13.8515 12.581 13.0567C11.9887 11.9413 11.2453 11.3477 9.51781 11.3477C8.56765 11.3477 6.00947 11.6876 5.96406 13.9556C5.95929 14.1935 5.96394 14.4116 5.98016 14.6122L10.6516 14.6481C10.0218 15.7092 9.43199 16.4962 8.91561 17.0945C9.53562 17.2633 10.0472 17.4049 10.517 17.5349C10.9626 17.6583 11.3706 17.7713 11.7976 17.887C12.4417 17.3886 13.0472 16.8452 13.5763 16.3219Z"
          fill="url(#paint2_linear_9302_60023)"
        />
        <path
          d="M5.36799 14.3792C5.55883 16.1021 6.48079 16.7773 8.36473 16.9771C10.2487 17.177 11.3293 17.0429 12.768 17.1819C13.9696 17.2981 15.0426 17.9483 15.4406 17.7236C15.7988 17.5214 15.5984 16.7907 15.119 16.3219C14.4978 15.7142 13.6379 15.2917 12.1248 15.1417C12.4264 14.2649 12.3419 13.0355 11.8735 12.3666C11.1964 11.3995 9.94655 10.9623 8.36473 11.1533C6.71207 11.3529 5.12849 12.217 5.36799 14.3792Z"
          fill="url(#paint3_linear_9302_60023)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9302_60023"
            x1="8.72107"
            y1="12.0892"
            x2="19.8771"
            y2="15.068"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_9302_60023"
            x1="17.92"
            y1="11.8668"
            x2="9.4573"
            y2="3.87901"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8697FF" />
            <stop offset="1" stopColor="#8697FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_9302_60023"
            x1="13.7984"
            y1="16.6178"
            x2="5.90888"
            y2="12.3469"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8697FF" />
            <stop offset="1" stopColor="#8697FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_9302_60023"
            x1="9.38149"
            y1="12.0006"
            x2="14.9543"
            y2="18.6678"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.983895" stopColor="#D1D8FF" />
          </linearGradient>
        </defs>
      </svg>
    ),
  ),
);

RabbyColorIcon.displayName = "RabbyColorIcon";
