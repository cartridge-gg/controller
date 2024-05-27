import { Button } from "@chakra-ui/react";
import { requestStorageDropCookie } from "components/Auth/utils";
import type { NextPage } from "next";

const CookieDropper: NextPage = () => {
  return (
    <Button
      onClick={() => {
        requestStorageDropCookie()
          .then(() => {
            console.log("dropped it like its hot!");
          })
          .catch((e) => {
            console.error(e);
          });
      }}
    >
      Drop Cookie!
    </Button>
  );
};

export default CookieDropper;
