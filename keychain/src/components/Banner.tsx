import React from "react";
import { Box, Heading, useStyleConfig, StyleProps } from "@chakra-ui/react";

const Banner = ({
  title,
  variant,
  children,
  ...rest
}: StyleProps & {
  title: string;
  variant?: any;
  children: React.ReactNode;
}) => {
  const styles = useStyleConfig("Banner", { variant });
  return (
    <Box __css={styles} textAlign={"center"} {...rest}>
      <Heading fontSize={16} textStyle="heading">
        {title}
      </Heading>
      <Box mt={3} fontSize={13} color="#888">
        {children}
      </Box>
    </Box>
  );
};

export default Banner;
