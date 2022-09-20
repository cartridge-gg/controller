import React from "react";
import { IconProps } from "@chakra-ui/react";
import Icon from "./Icon";

export function Checkbox({
  className,
  ...rest
}: IconProps & { className?: string }) {
  return (
    <Icon className={className} {...rest}>
      <path d="M19.1429 2C20.7188 2 22 3.27902 22 4.85714V19.1429C22 20.7188 20.7188 22 19.1429 22H4.85714C3.27902 22 2 20.7188 2 19.1429V4.85714C2 3.27902 3.27902 2 4.85714 2H19.1429ZM17.1696 10.0268C17.6562 9.54018 17.6562 8.74554 17.1696 8.25893C16.683 7.77232 15.8884 7.77232 15.4018 8.25893L10.5714 13.0893L8.59821 11.1161C8.11161 10.6295 7.31696 10.6295 6.83036 11.1161C6.34241 11.6027 6.34241 12.3973 6.83036 12.8839L9.6875 15.7411C10.1741 16.2277 10.9688 16.2277 11.4554 15.7411L17.1696 10.0268Z" />
    </Icon>
  );
}

export default Checkbox;
