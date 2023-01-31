import React from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";

const Times = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 25 25" fill="currentColor" __css={styles} {...rest}>
      <path d="M19.5269 17.7123C19.9368 18.1212 19.9368 18.7845 19.5269 19.1934C19.1169 19.6022 18.4518 19.6022 18.0418 19.1934L12.8718 13.9989L7.66502 19.1916C7.25508 19.6004 6.58997 19.6004 6.17999 19.1916C5.77001 18.7828 5.77005 18.1195 6.17999 17.7106L11.3885 12.5196L6.17855 7.28765C5.76861 6.87882 5.76861 6.21551 6.17855 5.80664C6.58848 5.39777 7.25359 5.39781 7.66357 5.80664L12.8718 11.0404L18.0786 5.84766C18.4885 5.43883 19.1536 5.43883 19.5636 5.84766C19.9736 6.25648 19.9736 6.9198 19.5636 7.32867L14.3551 12.5196L19.5269 17.7123Z" />
    </Icon>
  );
};

export default Times;
