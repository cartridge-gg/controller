import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Lock = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 24 24" fill="currentColor" __css={styles} {...rest}>
      <path d="M10.3711 9V10.5H15.3711V9C15.3711 7.61875 14.2523 6.5 12.8711 6.5C11.4898 6.5 10.3711 7.61875 10.3711 9ZM8.37109 10.5V9C8.37109 6.51562 10.3867 4.5 12.8711 4.5C15.3555 4.5 17.3711 6.51562 17.3711 9V10.5H17.8711C18.9742 10.5 19.8711 11.3969 19.8711 12.5V18.5C19.8711 19.6031 18.9742 20.5 17.8711 20.5H7.87109C6.76797 20.5 5.87109 19.6031 5.87109 18.5V12.5C5.87109 11.3969 6.76797 10.5 7.87109 10.5H8.37109Z" />
    </Icon>
  );
};

export default Lock;
