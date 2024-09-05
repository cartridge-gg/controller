import { truncateHash } from "../utils";
import { CopyText } from "./CopyText";
import { TextProps } from "@chakra-ui/react";

export function CopyHash({ hash, ...textProps }: { hash: string } & TextProps) {
  return (
    <CopyText
      value={truncateHash(hash, 12, 10)}
      copyValue={hash}
      {...textProps}
    />
  );
}
