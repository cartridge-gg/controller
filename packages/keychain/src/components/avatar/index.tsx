import { Box, Image, Spinner } from "@chakra-ui/react";

import { useConnection } from "hooks/connection";
import { PropsWithChildren, useEffect, useState } from "react";
import { cairo, shortString } from "starknet";
import { selectors, VERSION } from "utils/selectors";
import Storage from "utils/storage";

const avatarAddress =
  "0x56be7d500bd759ac4f96f786f15e9e4702c1ae0582091b20c90546e44ba42fc";

export const stringFromByteArray = (arr: string[]) => {
  arr = arr.slice(1, -1);
  while (arr.length > 0 && arr[arr.length - 1] === "0x0") {
    arr = arr.slice(0, -1);
  }

  return arr.map((i) => shortString.decodeShortString(i)).join("");
};

export function Avatar({ children }: PropsWithChildren) {
  const { controller } = useConnection();

  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const avatarSelector = selectors[VERSION].avatar(controller.address);

    const init = async () => {
      const fromStorage = Storage.get(avatarSelector);
      if (fromStorage && fromStorage !== "") {
        setImage(fromStorage.image);
        return;
      }

      setIsLoading(true);
      try {
        const tokenId = cairo.uint256(controller.address);
        let metadataRaw = await controller.account.callContract({
          contractAddress: avatarAddress,
          entrypoint: "token_uri",
          calldata: [tokenId.low, tokenId.high],
        });

        const metadataString = stringFromByteArray(metadataRaw);
        const metadataJson = JSON.parse(metadataString);

        Storage.set(avatarSelector, metadataJson);
        setImage(metadataJson.image);
      } catch (e) {
        // console.log(e);
        setImage("");
      }
      setIsLoading(false);
    };

    init();
  }, [controller.address]);

  return (
    <Box
      width={"48px"}
      height={"48px"}
      display={"flex"}
      flexShrink={0}
      position={"relative"}
    >
      {!isLoading && image !== "" ? <Image src={image} /> : <>{children}</>}
      {isLoading && (
        <Spinner position={"absolute"} size="sm" top={"16px"} left={"16px"} />
      )}
    </Box>
  );
}
