import { Icon, useStyleConfig } from "@chakra-ui/react";

export function Ether(props: any) {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("Logo", { variant, size });
  return (
    <Icon viewBox="0 0 12 12" fill="currentColor" __css={styles} {...rest}>
      <path d="M8.90303 6.08437L6.23291 7.71563L3.56104 6.08437L6.23291 1.5L8.90303 6.08437ZM6.23291 8.23945L3.56104 6.6082L6.23291 10.5L8.90479 6.6082L6.23291 8.23945Z" fill="white" />
    </Icon>
  );
}

export default Ether;


