import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

export const AvatarA = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 8 10"
      w="8px"
      h="10px"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path d="M0.800781 0.200195H2.40078V1.8002H0.800781V0.200195Z" />
      <path d="M0.800781 3.4002H2.40078V5.0002H0.800781V3.4002Z" />
      <path d="M5.60078 3.4002H7.20078V5.0002H5.60078V3.4002Z" />
      <path d="M2.40078 8.2002H4.00078V9.8002H2.40078V8.2002Z" />
      <path d="M4.00078 8.2002H5.60078V9.8002H4.00078V8.2002Z" />
      <path d="M5.60078 0.200195H7.20078V1.8002H5.60078V0.200195Z" />
    </Icon>
  );
};

export const AvatarB = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 14 14"
      w="14px"
      h="14px"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path d="M2.19961 2.19961H3.79961V3.79961H2.19961V2.19961Z" />
      <path d="M5.39961 0.599609H6.99961V2.19961H5.39961V0.599609Z" />
      <path d="M6.99961 0.599609H8.59961V2.19961H6.99961V0.599609Z" />
      <path d="M3.79961 6.99961H5.39961V8.59961H3.79961V6.99961Z" />
      <path d="M8.59961 6.99961H10.1996V8.59961H8.59961V6.99961Z" />
      <path d="M0.599609 8.59961H2.19961V10.1996H0.599609V8.59961Z" />
      <path d="M11.7996 8.59961H13.3996V10.1996H11.7996V8.59961Z" />
      <path d="M2.19961 10.1996H3.79961V11.7996H2.19961V10.1996Z" />
      <path d="M10.1996 10.1996H11.7996V11.7996H10.1996V10.1996Z" />
      <path d="M5.39961 11.7996H6.99961V13.3996H5.39961V11.7996Z" />
      <path d="M6.99961 11.7996H8.59961V13.3996H6.99961V11.7996Z" />
      <path d="M10.1996 2.19961H11.7996V3.79961H10.1996V2.19961Z" />
    </Icon>
  );
};

export const AvatarC = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon
      viewBox="0 0 14 14"
      w="14px"
      h="14px"
      fill="currentColor"
      __css={styles}
      {...rest}
    >
      <path d="M2.19961 2.19961H3.79961V3.79961H2.19961V2.19961Z" />
      <path d="M3.79961 2.19961H5.39961V3.79961H3.79961V2.19961Z" />
      <path d="M3.79961 0.599609H5.39961V2.19961H3.79961V0.599609Z" />
      <path d="M5.39961 2.19961H6.99961V3.79961H5.39961V2.19961Z" />
      <path d="M6.99961 2.19961H8.59961V3.79961H6.99961V2.19961Z" />
      <path d="M3.79961 6.99961H5.39961V8.59961H3.79961V6.99961Z" />
      <path d="M0.599609 6.99961H2.19961V8.59961H0.599609V6.99961Z" />
      <path d="M8.59961 6.99961H10.1996V8.59961H8.59961V6.99961Z" />
      <path d="M11.7996 6.99961H13.3996V8.59961H11.7996V6.99961Z" />
      <path d="M0.599609 8.59961H2.19961V10.1996H0.599609V8.59961Z" />
      <path d="M11.7996 8.59961H13.3996V10.1996H11.7996V8.59961Z" />
      <path d="M2.19961 10.1996H3.79961V11.7996H2.19961V10.1996Z" />
      <path d="M10.1996 10.1996H11.7996V11.7996H10.1996V10.1996Z" />
      <path d="M5.39961 11.7996H6.99961V13.3996H5.39961V11.7996Z" />
      <path d="M6.99961 11.7996H8.59961V13.3996H6.99961V11.7996Z" />
      <path d="M5.39961 3.79961H6.99961V5.39961H5.39961V3.79961Z" />
      <path d="M6.99961 3.79961H8.59961V5.39961H6.99961V3.79961Z" />
      <path d="M8.59961 2.19961H10.1996V3.79961H8.59961V2.19961Z" />
      <path d="M8.59961 0.599609H10.1996V2.19961H8.59961V0.599609Z" />
      <path d="M10.1996 2.19961H11.7996V3.79961H10.1996V2.19961Z" />
    </Icon>
  );
};
