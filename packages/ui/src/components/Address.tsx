import React from "react";
import { Flex, forwardRef } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { Badge } from "../components/Badge";

export function formatAddress(address: string, chars: number = 4): string {
  return `${address.substring(0, 2 + chars)}...${address.substring(
    address.length - chars,
  )}`;
}

const Icon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    css={css`
      margin-right: 5px;
    `}
  >
    <path
      d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
      fill="#252926"
    />
    <rect x="3" y="3" width="10" height="10" fill="url(#pattern0)" />
    <defs>
      <pattern
        id="pattern0"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use xlinkHref="#image0_1841_741" transform="scale(0.0125)" />
      </pattern>
      <image
        id="image0_1841_741"
        width="80"
        height="80"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEFSURBVHgB7dvRCcIwFEDRVnQkl3Bgl3AkPxQHKARuaD48Z4HSy/tISLK/X4/PtsDt/ty3iVb9x2UjETASMBIwEjASMBIwEjASMBreDaxa6a8yulMygZGAkYCRgJGAkYCRgJGAkYDRdZtsdAU/e2ez6rsmMBIwEjASMBIwEjASMBIwEjDa/+2sYzYTGAkYCRgJGAkYCRgJGAkYCRi5nXXA7ayTCBgJGAkYCRgJGAkYCRgJGE19Nf4zumNZ9WJ99ndNYCRgJGAkYCRgJGAkYCRgJGDkTOSAM5GTCBgJGAkYCRgJGAkYCRgJGE0/Exm16sX6bCYwEjASMBIwEjASMBIwEjASMPoCt9Aquln/OkEAAAAASUVORK5CYII="
      />
    </defs>
  </svg>
);

type AddressProps = { children: string; style?: React.CSSProperties };

// Workaround
export const Address: React.FC<AddressProps> = forwardRef(
  (
    { children, style }: AddressProps,
    ref,
  ) => (
    <Badge style={style}>
      <Flex alignItems="center">
        <Icon />
        <span ref={ref}>{formatAddress(children)}</span>
      </Flex>
    </Badge>
  ),
);
