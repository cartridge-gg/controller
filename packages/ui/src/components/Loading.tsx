import { css } from "@emotion/react";
import { Box } from "@chakra-ui/react";

export const Loading = ({
  color = "text.primary",
  hidden = false,
  size = "20px",
}: {
  color?: string;
  hidden?: boolean;
  size?: string;
}) => (
  <Box
    h={size}
    w={size}
    color={color}
    visibility={hidden ? "hidden" : "visible"}
    css={css`
      border-radius: 50%;
      border-radius: 100em 100em 0 0;
      transform-origin: bottom;
      -webkit-animation: eating-top 0.5s infinite;
      animation: eating-top 0.5s infinite;
      width: ${size};
      height: calc(${size} / 2);
      background: currentColor;

      &::before {
        width: ${size};
        height: calc(${size} / 2);
        background: currentColor;
      }
      &::before {
        content: "";
        display: block;
        margin-top: calc(${size} / 2);
        position: absolute;
        transform-origin: top;
        border-radius: 0 0 100em 100em;
        transform: rotate(80deg);
        -webkit-animation: eating-bottom 0.5s infinite;
        animation: eating-bottom 0.5s infinite;
      }
      @-webkit-keyframes eating-top {
        0% {
          transform: rotate(-40deg);
        }
        50% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-40deg);
        }
      }
      @keyframes eating-top {
        0% {
          transform: rotate(-40deg);
        }
        50% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-40deg);
        }
      }
      @-webkit-keyframes eating-bottom {
        0% {
          transform: rotate(80deg);
        }
        50% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(80deg);
        }
      }
      @keyframes eating-bottom {
        0% {
          transform: rotate(80deg);
        }
        50% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(80deg);
        }
      }
      @-webkit-keyframes center {
        0% {
          transform: rotate(40deg);
        }
        50% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(40deg);
        }
      }
      @keyframes center {
        0% {
          transform: rotate(40deg);
        }
        50% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(40deg);
        }
      }
    `}
  ></Box>
);
