import { Button } from "@chakra-ui/react";
import { dropCookie } from "components/Auth/utils";
import type { NextPage } from "next";

const CookieDropper: NextPage = () => {
  return (
    <Button
      onClick={() => {
        dropCookie()
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
