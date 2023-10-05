import React from "react";
import { css } from "@emotion/react";
import { Box } from "@chakra-ui/react";
import { useLottie } from "lottie-react";
import startupAnimation from "../lottie/startup.json";
import { FullPageAnimation } from "./Animation";

export const Loading = ({
  fill = "#0f1410",
  hidden = false,
  width = "20px",
  height = "20px",
}: {
  fill?: string;
  hidden?: boolean;
  width?: string;
  height?: string;
}) => (
  <Box
    h={height}
    w={width}
    color={fill}
    visibility={hidden ? "hidden" : "visible"}
  >
    <div
      css={css`
        border-radius: 50%;
        border-radius: 100em 100em 0 0;
        transform-origin: bottom;
        -webkit-animation: eating-top 0.5s infinite;
        animation: eating-top 0.5s infinite;
        width: ${width};
        height: calc(${height} / 2);
        background: currentColor;

        &::before {
          width: ${width};
          height: calc(${height} / 2);
          background: currentColor;
        }
        &::before {
          content: "";
          display: block;
          margin-top: calc(${height} / 2);
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
    ></div>
  </Box>
);

export function LoadingLogo() {
  const { View } = useLottie({
    animationData: startupAnimation,
    loop: true,
    autoplay: true,
  });

  return <FullPageAnimation show={true} View={View} />;
}
