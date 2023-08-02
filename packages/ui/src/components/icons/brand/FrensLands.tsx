import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const FrensLandsIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    ...iconProps
  }: Props) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });

    return (
      <Icon viewBox="0 0 24 24" __css={styles} boxSize={boxSize} {...iconProps}>
        <path
          d="M5.77783 5.44144H7.46782V7.02703H5.77783V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 6.88288H7.46782V8.46847H5.77783V6.88288Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 8.32432H7.46782V9.90991H5.77783V8.32432Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 9.76577H7.46782V11.3514H5.77783V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 11.2072H7.46782V12.7928H5.77783V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 12.6486H7.46782V14.2342H5.77783V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 14.0901H7.46782V15.6757H5.77783V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 15.5315H7.46782V17.1171H5.77783V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M5.77783 16.973H7.46782V18.5586H5.77783V16.973Z"
          fill="currentColor"
        />
        <path
          d="M7.31418 18.4144H9.00417V20H7.31418V18.4144Z"
          fill="currentColor"
        />
        <path
          d="M8.85053 18.4144H10.5405V20H8.85053V18.4144Z"
          fill="currentColor"
        />
        <path
          d="M10.3869 18.4144H12.0769V20H10.3869V18.4144Z"
          fill="currentColor"
        />
        <path
          d="M11.9232 18.4144H13.6132V20H11.9232V18.4144Z"
          fill="currentColor"
        />
        <path
          d="M13.4596 18.4144H15.1496V20H13.4596V18.4144Z"
          fill="currentColor"
        />
        <path
          d="M14.9959 18.4144H16.6859V20H14.9959V18.4144Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 16.973H18.2223V18.5586H16.5323V16.973Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 15.5315H18.2223V17.1171H16.5323V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 14.0901H18.2223V15.6757H16.5323V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 12.6486H18.2223V14.2342H16.5323V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 11.2072H18.2223V12.7928H16.5323V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 9.76577H18.2223V11.3514H16.5323V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 8.32432H18.2223V9.90991H16.5323V8.32432Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 6.88288H18.2223V8.46847H16.5323V6.88288Z"
          fill="currentColor"
        />
        <path
          d="M16.5323 5.44144H18.2223V7.02703H16.5323V5.44144Z"
          fill="currentColor"
        />
        <path d="M14.9959 4H16.6859V5.58559H14.9959V4Z" fill="currentColor" />
        <path d="M13.4596 4H15.1496V5.58559H13.4596V4Z" fill="currentColor" />
        <path d="M11.9232 4H13.6132V5.58559H11.9232V4Z" fill="currentColor" />
        <path d="M10.3869 4H12.0769V5.58559H10.3869V4Z" fill="currentColor" />
        <path d="M8.85053 4H10.5405V5.58559H8.85053V4Z" fill="currentColor" />
        <path d="M7.31418 4H9.00417V5.58559H7.31418V4Z" fill="currentColor" />
        <path
          d="M7.31418 6.88288H9.00417V8.46847H7.31418V6.88288Z"
          fill="currentColor"
        />
        <path
          d="M7.31418 8.32432H9.00417V9.90991H7.31418V8.32432Z"
          fill="currentColor"
        />
        <path
          d="M10.5405 8.32432H12.2305V9.90991H10.5405V8.32432Z"
          fill="currentColor"
        />
        <path
          d="M10.5405 6.88288H12.2305V8.46847H10.5405V6.88288Z"
          fill="currentColor"
        />
        <path
          d="M10.5405 5.44144H12.2305V7.02703H10.5405V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M9.00417 5.44144H10.6942V7.02703H9.00417V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M7.46782 5.44144H9.1578V7.02703H7.46782V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 6.88288H13.4596V8.46847H11.7696V6.88288Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 5.44144H13.4596V7.02703H11.7696V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M13.306 5.44144H14.9959V7.02703H13.306V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 5.44144H16.5323V7.02703H14.8423V5.44144Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 8.32432H13.4596V9.90991H11.7696V8.32432Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 9.76577H13.4596V11.3514H11.7696V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M13.306 9.76577H14.9959V11.3514H13.306V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 9.76577H16.5323V11.3514H14.8423V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M10.2333 9.76577H11.9232V11.3514H10.2333V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M8.6969 9.76577H10.3869V11.3514H8.6969V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M7.16055 9.76577H8.85053V11.3514H7.16055V9.76577Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 11.2072H13.4596V12.7928H11.7696V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M13.306 11.2072H14.9959V12.7928H13.306V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 11.2072H16.5323V12.7928H14.8423V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M10.2333 11.2072H11.9232V12.7928H10.2333V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M8.6969 11.2072H10.3869V12.7928H8.6969V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M7.16055 11.2072H8.85053V12.7928H7.16055V11.2072Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 12.6486H13.4596V14.2342H11.7696V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M13.306 12.6486H14.9959V14.2342H13.306V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 12.6486H16.5323V14.2342H14.8423V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M10.2333 12.6486H11.9232V14.2342H10.2333V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M8.6969 12.6486H10.3869V14.2342H8.6969V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M7.16055 12.6486H8.85053V14.2342H7.16055V12.6486Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 14.0901H13.4596V15.6757H11.7696V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M13.306 14.0901H14.9959V15.6757H13.306V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 14.0901H16.5323V15.6757H14.8423V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M10.2333 14.0901H11.9232V15.6757H10.2333V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M8.6969 14.0901H10.3869V15.6757H8.6969V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M7.16055 14.0901H8.85053V15.6757H7.16055V14.0901Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 15.5315H13.4596V17.1171H11.7696V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M13.306 15.5315H14.9959V17.1171H13.306V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 15.5315H16.5323V17.1171H14.8423V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M10.2333 15.5315H11.9232V17.1171H10.2333V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M8.6969 15.5315H10.3869V17.1171H8.6969V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M7.16055 15.5315H8.85053V17.1171H7.16055V15.5315Z"
          fill="currentColor"
        />
        <path
          d="M11.7696 16.973H13.4596V18.5586H11.7696V16.973Z"
          fill="currentColor"
        />
        <path
          d="M13.306 16.973H14.9959V18.5586H13.306V16.973Z"
          fill="currentColor"
        />
        <path
          d="M14.8423 16.973H16.5323V18.5586H14.8423V16.973Z"
          fill="currentColor"
        />
        <path
          d="M10.2333 16.973H11.9232V18.5586H10.2333V16.973Z"
          fill="currentColor"
        />
        <path
          d="M8.6969 16.973H10.3869V18.5586H8.6969V16.973Z"
          fill="currentColor"
        />
        <path
          d="M7.16055 16.973H8.85053V18.5586H7.16055V16.973Z"
          fill="currentColor"
        />
        <path
          d="M14.9959 8.32432H16.6859V9.90991H14.9959V8.32432Z"
          fill="currentColor"
        />
        <path
          d="M14.9959 6.88288H16.6859V8.46847H14.9959V6.88288Z"
          fill="currentColor"
        />
      </Icon>
    );
  },
);
