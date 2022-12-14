import { Icon, useStyleConfig } from "@chakra-ui/react";

const Laptop = (props: any) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Icon", { variant, size });

  return (
    <Icon viewBox="0 0 25 25" fill="currentColor" __css={styles} {...rest}>
      <path d="M6.57109 6.2002H5.67109V7.1002V15.2002H7.47109V8.0002H18.2711V15.2002H20.0711V7.1002V6.2002H19.1711H6.57109ZM3.87109 16.1002V17.4502L5.22109 18.8002H20.5211L21.8711 17.4502V16.1002H3.87109Z" />
    </Icon>
  );
};

export default Laptop;
