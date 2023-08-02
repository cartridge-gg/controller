import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const CreditCardDuoIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    accent = "brand.accent",
    ...iconProps
  }: DuotoneIconProps) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" __css={styles} boxSize={boxSize} {...iconProps}>
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M4 9.389a2.444 2.444 0 0 1 2.444-2.445h17.112A2.445 2.445 0 0 1 26 9.39V21.61a2.447 2.447 0 0 1-2.444 2.444H6.444A2.445 2.445 0 0 1 4 21.611V9.389Zm1.833 0V21.61c0 .336.274.611.611.611h17.112a.613.613 0 0 0 .61-.611V9.389a.612.612 0 0 0-.61-.611H6.444a.61.61 0 0 0-.61.61Z"
        />
        <path
          fill={accentToken}
          d="M7.667 19.472c0-.508.408-.917.916-.917h1.834c.508 0 .916.41.916.917a.914.914 0 0 1-.916.917H8.583a.914.914 0 0 1-.916-.917Zm4.889 0c0-.508.408-.917.916-.917h4.278c.508 0 .917.41.917.917a.914.914 0 0 1-.917.917h-4.278a.914.914 0 0 1-.916-.917Zm-4.89-3.056c0-.508.41-.916.917-.916h12.834c.508 0 .916.409.916.916a.914.914 0 0 1-.916.917H8.583a.914.914 0 0 1-.916-.916Zm13.75-5.805c.509 0 .917.409.917.917v1.833a.914.914 0 0 1-.916.917H18.36a.914.914 0 0 1-.917-.917v-1.833c0-.508.41-.917.917-.917h3.056Z"
        />
      </Icon>
    );
  },
);
