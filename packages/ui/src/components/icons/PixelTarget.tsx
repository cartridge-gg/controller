import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const PixelTarget = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="currentColor"
      __css={styles}
      {...rest}
      shapeRendering="crispEdges"
    >
      <g opacity="0.25">
        <path d="M3.60005 3.5998H6.40005V6.39981H3.60005V3.5998Z" />
        <path d="M6.40005 0.799805H9.20005V3.5998H6.40005V0.799805Z" />
        <path d="M14.8001 0.799805H17.6V3.5998H14.8001V0.799805Z" />
        <path d="M17.6 3.5998H20.4001V6.39981H17.6V3.5998Z" />
        <path d="M0.800049 6.39981H3.60005V9.19981H0.800049V6.39981Z" />
        <path d="M20.4001 6.39981H23.2001V9.19981H20.4001V6.39981Z" />
        <path d="M20.4001 14.7998H23.2001V17.5998H20.4001V14.7998Z" />
        <path d="M0.800049 14.7998H3.60005V17.5998H0.800049V14.7998Z" />
        <path d="M3.60005 17.5998H6.40005V20.3998H3.60005V17.5998Z" />
        <path d="M17.6 17.5998H20.4001V20.3998H17.6V17.5998Z" />
        <path d="M14.8001 20.3998H17.6V23.1998H14.8001V20.3998Z" />
        <path d="M6.40005 20.3998H9.20005V23.1998H6.40005V20.3998Z" />
      </g>
      <path d="M9.19995 12.0002H12V14.8002H9.19995V12.0002Z" />
      <path d="M12 12.0002H14.8V14.8002H12V12.0002Z" />
      <path d="M12 9.2002H14.8V12.0002H12V9.2002Z" />
      <path d="M9.19995 9.2002H12V12.0002H9.19995V9.2002Z" />
      <g opacity="0.5">
        <path d="M6.4001 6.4001H9.2001V9.2001H6.4001V6.4001Z" />
        <path d="M9.2001 3.6001H12.0001V6.4001H9.2001V3.6001Z" />
        <path d="M3.6001 12.0001H6.4001V14.8001H3.6001V12.0001Z" />
        <path d="M3.6001 9.2001H6.4001V12.0001H3.6001V9.2001Z" />
        <path d="M17.6001 12.0001H20.4001V14.8001H17.6001V12.0001Z" />
        <path d="M17.6001 9.2001H20.4001V12.0001H17.6001V9.2001Z" />
        <path d="M14.8001 14.8001H17.6001V17.6001H14.8001V14.8001Z" />
        <path d="M6.4001 14.8001H9.2001V17.6001H6.4001V14.8001Z" />
        <path d="M9.2001 17.6001H12.0001V20.4001H9.2001V17.6001Z" />
        <path d="M12.0001 17.6001H14.8001V20.4001H12.0001V17.6001Z" />
        <path d="M14.8001 6.4001H17.6001V9.2001H14.8001V6.4001Z" />
        <path d="M12.0001 3.6001H14.8001V6.4001H12.0001V3.6001Z" />
      </g>
    </Icon>
  );
};

export default PixelTarget;
