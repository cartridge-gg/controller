import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const ArrowIcon = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 10 10" fill="currentColor" __css={styles} {...rest}>
      <path d="M5.78387 0.769635L9.63104 4.44193C9.73487 4.54098 9.79362 4.67823 9.79362 4.82184C9.79362 4.96545 9.73487 5.10251 9.63104 5.20175L5.78387 8.87405C5.57415 9.07351 5.2422 9.06599 5.04198 8.85629C4.84184 8.64863 4.84936 8.31528 5.05974 8.11439L7.96041 5.34706H0.524833C0.235202 5.34706 0 5.11185 0 4.82222C0 4.53259 0.235202 4.29783 0.524833 4.29783H7.95905L5.05837 1.53049C4.84831 1.32922 4.84175 0.995874 5.04067 0.787559C5.24177 0.577713 5.55435 0.570281 5.78387 0.769635Z" />
    </Icon>
  );
};

export default ArrowIcon;
